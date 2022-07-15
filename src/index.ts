import './dom';

function extractMediaStreamTrack(stream: MediaStream) {
    const tracks = stream.getTracks();

    if (tracks.length !== 1) {
        throw new Error('an unknown error occurred');
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
        throw new Error('an unknown error occurred');
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
        throw new Error('invalid audio device ID');
    }

    if (constraints.video?.deviceId.exact && (!videoDevice || videoDevice.kind !== 'videoinput')) {
        throw new Error('invalid video device ID');
    }

    if (audioDevice) {
        const audioTrack = createAudioStreamTrack();

        await registerMediaStreamTrack(
            mediaStream,
            audioTrack,
            <InputDeviceInfo>audioDevice,
            (<EmulatedDeviceMeta>meta).deviceMediaStreamTrackMap[audioDevice.deviceId],
        );
    }

    if (videoDevice) {
        const videoTrack = createVideoStreamTrack();

        await registerMediaStreamTrack(
            mediaStream,
            videoTrack,
            <InputDeviceInfo>videoDevice,
            (<EmulatedDeviceMeta>meta).deviceMediaStreamTrackMap[videoDevice.deviceId],
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

    const deviceMediaStreamTrackMap = {
        [device.deviceId]: [],
    };

    if (!this.meta) {
        this.meta = {
            emulatedDevices: [device],
            deviceMediaStreamTrackMap,
        };
    } else {
        this.meta.emulatedDevices.push(device);
        this.meta.deviceMediaStreamTrackMap = deviceMediaStreamTrackMap;
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

    this.meta.deviceMediaStreamTrackMap[emulatorDeviceId].forEach((track) => track.stop());
    this.meta.emulatedDevices.splice(index, 1);
    delete this.meta.deviceMediaStreamTrackMap[emulatorDeviceId];
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
