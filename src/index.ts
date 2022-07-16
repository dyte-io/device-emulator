import './dom';

function extractMediaStreamTrack(stream: MediaStream) {
    const tracks = stream.getTracks();

    if (tracks.length !== 1) {
        throw new TypeError('UnknownError: an unknown error occurred');
    }

    return tracks[0];
}

function createAudioStreamTrack(props: EmulatedDeviceMetaProps) {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const dest = ctx.createMediaStreamDestination();

    osc.connect(gain);
    gain.connect(dest);
    osc.start();

    setInterval(() => {
        if (gain.gain.value !== +!props.silent) {
            gain.gain.value = +!props.silent;
        }
    });

    return extractMediaStreamTrack(dest.stream);
}

function createVideoStreamTrack(props: EmulatedDeviceMetaProps) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream();

    if (!ctx) {
        throw new TypeError('UnknownError: an unknown error occurred');
    }

    setInterval(() => {
        const imageData = new ImageData(canvas.width, canvas.height);

        for (let i = 0; i < imageData.data.length; i += 4) {
            if (!props.silent) {
                imageData.data[i] = Math.floor(Math.random() * 256);
                imageData.data[i + 1] = Math.floor(Math.random() * 256);
                imageData.data[i + 2] = Math.floor(Math.random() * 256);
            }

            imageData.data[i + 3] = 256;
        }

        ctx.putImageData(imageData, 0, 0);
    });

    return extractMediaStreamTrack(stream);
}

async function registerMediaStreamTrack(
    stream: MediaStream,
    mediaTrack: MediaStreamTrack,
    device: InputDeviceInfo,
    deviceTracks: MediaStreamTrack[],
) {
    const track = mediaTrack.clone();
    const { deviceId, groupId, ...capabilities } = device.getCapabilities();

    await track.applyConstraints(<MediaTrackConstraints>capabilities);

    const getConstraints = track.getConstraints.bind(track);
    const getSettings = track.getSettings.bind(track);
    const getCapabilities = track.getCapabilities.bind(track);

    track.getConstraints = () => ({
        ...getConstraints(),
        deviceId,
        groupId,
    });

    track.getSettings = () => ({
        ...getSettings(),
        deviceId,
        groupId,
    });

    track.getCapabilities = () => ({
        ...getCapabilities(),
        deviceId,
        groupId,
    });

    stream.addTrack(track);
    deviceTracks.push(track);
}

function isEmulatedMediaStreamConstraints(
    constraints?:
        | MediaStreamConstraints
        | DisplayMediaStreamConstraints
        | EmulatedMediaStreamConstraints,
): constraints is EmulatedMediaStreamConstraints {
    return !!(<EmulatedMediaStreamConstraints | undefined>constraints)?.emulated;
}

async function evaluateConstraints(
    constraints: EmulatedMediaStreamConstraints,
    meta?: EmulatedDeviceMeta,
) {
    const mediaStream = new MediaStream();

    if (!constraints.audio?.deviceId.exact && !constraints.video?.deviceId.exact) {
        throw new TypeError('AbortError: At least one of audio and video must be requested');
    }

    if (!meta) {
        throw new TypeError('NotFoundError: No emulated devices found, please create one first');
    }

    const audioDevice = meta.emulatedDevices.find(
        (device) => device.deviceId === constraints.audio?.deviceId.exact,
    );

    const videoDevice = meta.emulatedDevices.find(
        (device) => device.deviceId === constraints.video?.deviceId.exact,
    );

    if (constraints.audio?.deviceId.exact && (!audioDevice || audioDevice.kind !== 'audioinput')) {
        throw new OverconstrainedError('deviceId', 'Invalid audio device ID');
    }

    if (constraints.video?.deviceId.exact && (!videoDevice || videoDevice.kind !== 'videoinput')) {
        throw new OverconstrainedError('deviceId', 'Invalid video device ID');
    }

    if (audioDevice) {
        if (meta.meta[audioDevice.deviceId].bricked) {
            throw new TypeError('NotReadableError: Failed to allocate audiosource');
        }

        const audioTrack = createAudioStreamTrack(meta.meta[audioDevice.deviceId]);

        await registerMediaStreamTrack(
            mediaStream,
            audioTrack,
            <InputDeviceInfo>audioDevice,
            meta.meta[audioDevice.deviceId].tracks,
        );
    }

    if (videoDevice) {
        if (meta.meta[videoDevice.deviceId].bricked) {
            throw new TypeError('NotReadableError: Failed to allocate videosource');
        }

        const videoTrack = createVideoStreamTrack(meta.meta[videoDevice.deviceId]);

        await registerMediaStreamTrack(
            mediaStream,
            videoTrack,
            <InputDeviceInfo>videoDevice,
            meta.meta[videoDevice.deviceId].tracks,
        );
    }

    return mediaStream;
}

/* eslint-disable @typescript-eslint/unbound-method */
const originalSetSinkId = HTMLAudioElement.prototype.setSinkId;
const originalEnumerateDevices = MediaDevices.prototype.enumerateDevices;
const originalGetUserMedia = MediaDevices.prototype.getUserMedia;
const originalGetDisplayMedia = MediaDevices.prototype.getDisplayMedia;
/* eslint-enable @typescript-eslint/unbound-method */

function newSetSinkId(this: HTMLAudioElement, sinkId: string) {
    const emulatedDevice = navigator.mediaDevices.meta?.emulatedDevices.find(
        (device) => device.deviceId === sinkId,
    );

    if (emulatedDevice) {
        if (emulatedDevice.kind !== 'audiooutput') {
            return Promise.reject(new TypeError('NotFoundError: Requested device not found'));
        }

        this.sinkId = sinkId;

        return Promise.resolve();
    }

    return originalSetSinkId.call(this, sinkId);
}

function addEmulatedDevice(
    this: MediaDevices,
    kind: MediaDeviceKind,
    capabilities?: EmulatedDeviceCapabilitiesInput | void,
) {
    const groupId = 'emulated-device-group';
    const deviceId = crypto.randomUUID();
    const label = `Emulated device of kind \`${kind}\``;
    const device = { deviceId, kind, label, groupId, toJSON: () => device };

    if (kind === 'audioinput' || kind === 'videoinput') {
        Object.setPrototypeOf(device, InputDeviceInfo.prototype);

        (<InputDeviceInfo>device).getCapabilities = () => ({
            ...capabilities,
            deviceId: device.deviceId,
            groupId: device.groupId,
        });
    } else {
        Object.setPrototypeOf(device, MediaDeviceInfo.prototype);
    }

    const meta = {
        tracks: [],
        bricked: false,
        silent: false,
    };

    if (!this.meta) {
        this.meta = {
            emulatedDevices: [device],
            meta: {
                [device.deviceId]: meta,
            },
        };
    } else {
        this.meta.emulatedDevices.push(device);
        this.meta.meta[device.deviceId] = meta;
    }

    this.dispatchEvent(new Event('devicechange'));

    return deviceId;
}

function removeEmulatedDevice(this: MediaDevices, emulatorDeviceId: string) {
    if (!this.meta) {
        return false;
    }

    const index = this.meta.emulatedDevices.findIndex(
        (device) => device.deviceId === emulatorDeviceId,
    );

    if (index === -1) {
        return false;
    }

    this.dispatchEvent(new Event('devicechange'));
    this.meta.meta[emulatorDeviceId].tracks.forEach((track) => track.stop());
    this.meta.emulatedDevices.splice(index, 1);
    delete this.meta.meta[emulatorDeviceId];

    return true;
}

function silenceDevice(this: MediaDevices, emulatorDeviceId: string) {
    if (!this.meta) {
        return false;
    }

    const index = this.meta.emulatedDevices.findIndex(
        (device) => device.deviceId === emulatorDeviceId,
    );

    if (index === -1) {
        return false;
    }

    this.meta.meta[emulatorDeviceId].silent = true;

    return true;
}

function brickDevice(this: MediaDevices, emulatorDeviceId: string) {
    if (!this.meta) {
        return false;
    }

    const index = this.meta.emulatedDevices.findIndex(
        (device) => device.deviceId === emulatorDeviceId,
    );

    if (index === -1) {
        return false;
    }

    this.meta.meta[emulatorDeviceId].tracks.forEach((track) => track.stop());
    this.meta.meta[emulatorDeviceId].bricked = true;
    this.meta.meta[emulatorDeviceId].tracks.length = 0;

    return true;
}

async function newEnumerateDevices(this: MediaDevices) {
    const realDevices = await originalEnumerateDevices.call(this);

    if (!this.meta) {
        return realDevices;
    }

    return this.meta.emulatedDevices.concat(realDevices);
}

function newGetUserMedia(
    this: MediaDevices,
    constraints?: MediaStreamConstraints | EmulatedMediaStreamConstraints,
) {
    if (isEmulatedMediaStreamConstraints(constraints)) {
        return evaluateConstraints(constraints, this.meta);
    }

    return originalGetUserMedia.call(this, constraints);
}

function newGetDisplayMedia(
    this: MediaDevices,
    constraints?: DisplayMediaStreamConstraints | EmulatedMediaStreamConstraints,
) {
    if (isEmulatedMediaStreamConstraints(constraints)) {
        return evaluateConstraints(constraints, this.meta);
    }

    return originalGetDisplayMedia.call(this, constraints);
}

HTMLAudioElement.prototype.setSinkId = newSetSinkId;
MediaDevices.prototype.addEmulatedDevice = addEmulatedDevice;
MediaDevices.prototype.removeEmulatedDevice = removeEmulatedDevice;
MediaDevices.prototype.silenceDevice = silenceDevice;
MediaDevices.prototype.brickDevice = brickDevice;
MediaDevices.prototype.enumerateDevices = newEnumerateDevices;
MediaDevices.prototype.getUserMedia = newGetUserMedia;
MediaDevices.prototype.getDisplayMedia = newGetDisplayMedia;
