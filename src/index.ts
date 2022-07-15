import './dom';

function extractMediaStreamTrack(stream: MediaStream) {
    const tracks = stream.getTracks();

    if (tracks.length !== 1) {
        throw new DOMException('an unknown error occurred', 'ABORT_ERR');
    }

    return tracks[0];
}

function createAudioStreamTrack() {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const dest = ctx.createMediaStreamDestination();

    osc.connect(dest);
    osc.start();

    return extractMediaStreamTrack(dest.stream);
}

function createVideoStreamTrack() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream();

    if (!ctx) {
        throw new DOMException('an unknown error occurred', 'ABORT_ERR');
    }

    setInterval(() => {
        ctx.putImageData(ctx.createImageData(canvas.width, canvas.height), 0, 0);
    });

    return extractMediaStreamTrack(stream);
}

async function registerMediaStreamTrack(
    stream: MediaStream,
    mediaTrack: MediaStreamTrack,
    device: InputDeviceInfo,
    deviceTracks: MediaStreamTrack[],
) {
    const track = mediaTrack;
    const { deviceId, groupId, ...capabilities } = device.getCapabilities();

    await track.applyConstraints(capabilities);

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

    const audioDevice = meta?.emulatedDevices.find(
        (device) => device.deviceId === constraints.audio?.deviceId.exact,
    );

    const videoDevice = meta?.emulatedDevices.find(
        (device) => device.deviceId === constraints.video?.deviceId.exact,
    );

    if (constraints.audio?.deviceId.exact && (!audioDevice || audioDevice.kind !== 'audioinput')) {
        throw new OverconstrainedError('deviceId', 'invalid audio device ID');
    }

    if (constraints.video?.deviceId.exact && (!videoDevice || videoDevice.kind !== 'videoinput')) {
        throw new OverconstrainedError('deviceId', 'invalid video device ID');
    }

    if (audioDevice) {
        const audioTrack = createAudioStreamTrack();

        await registerMediaStreamTrack(
            mediaStream,
            audioTrack,
            <InputDeviceInfo>audioDevice,
            (<EmulatedDeviceMeta>meta).meta[audioDevice.deviceId].tracks,
        );
    }

    if (videoDevice) {
        const videoTrack = createVideoStreamTrack();

        await registerMediaStreamTrack(
            mediaStream,
            videoTrack,
            <InputDeviceInfo>videoDevice,
            (<EmulatedDeviceMeta>meta).meta[videoDevice.deviceId].tracks,
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
        [device.deviceId]: {
            tracks: [],
        },
    };

    if (!this.meta) {
        this.meta = {
            emulatedDevices: [device],
            meta,
        };
    } else {
        this.meta.emulatedDevices.push(device);
        this.meta.meta = meta;
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

    this.meta.meta[emulatorDeviceId].tracks.forEach((track) => track.stop());
    this.meta.emulatedDevices.splice(index, 1);
    delete this.meta.meta[emulatorDeviceId];
    this.dispatchEvent(new Event('devicechange'));

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
MediaDevices.prototype.enumerateDevices = newEnumerateDevices;
MediaDevices.prototype.getUserMedia = newGetUserMedia;
MediaDevices.prototype.getDisplayMedia = newGetDisplayMedia;
