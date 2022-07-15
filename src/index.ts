import './dom';

const extractMediaStreamTrack = (stream: MediaStream) => {
    const tracks = stream.getTracks();

    if (tracks.length !== 1) {
        throw new Error('an unknown error occurred');
    }

    return tracks[0];
};

const createAudioStreamTrack = () => {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const dest = ctx.createMediaStreamDestination();

    osc.connect(dest);
    osc.start();

    return extractMediaStreamTrack(dest.stream);
};

const createVideoStreamTrack = () => {
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
};

const isEmulatedMediaStreamConstraints = (
    constraints?:
        | MediaStreamConstraints
        | DisplayMediaStreamConstraints
        | EmulatedMediaStreamConstraints,
): constraints is EmulatedMediaStreamConstraints =>
    !!(<EmulatedMediaStreamConstraints | undefined>constraints)?.emulated;

const evaluateConstraints = async (
    devices: (MediaDeviceInfo | InputDeviceInfo)[] | undefined,
    constraints: EmulatedMediaStreamConstraints,
) => {
    const mediaStream = new MediaStream();

    const audioDevice = devices?.find(
        (device) => device.deviceId === constraints.audio?.deviceId.exact,
    );

    const videoDevice = devices?.find(
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
        const capabilities = (<InputDeviceInfo>audioDevice).getCapabilities();

        delete capabilities.deviceId;
        delete capabilities.groupId;

        await audioTrack.applyConstraints(capabilities);

        mediaStream.addTrack(audioTrack);
    }

    if (videoDevice) {
        const videoTrack = createVideoStreamTrack();
        const capabilities = (<InputDeviceInfo>videoDevice).getCapabilities();

        delete capabilities.deviceId;
        delete capabilities.groupId;

        await videoTrack.applyConstraints(capabilities);

        mediaStream.addTrack(videoTrack);
    }

    return mediaStream;
};

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
    capabilities?: Omit<
        MediaTrackCapabilities & MediaTrackConstraints,
        'deviceId' | 'groupId'
    > | void,
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

    if (!this.emulatedDevices) {
        this.emulatedDevices = [device];
    } else {
        this.emulatedDevices.push(device);
    }

    this.dispatchEvent(new Event('devicechange'));

    return deviceId;
}

function removeEmulatedDevice(this: MediaDevices, emulatorDeviceId: string) {
    if (!this.emulatedDevices) {
        return undefined;
    }

    const index = this.emulatedDevices.findIndex((device) => device.deviceId === emulatorDeviceId);

    if (index === -1) {
        return undefined;
    }

    this.dispatchEvent(new Event('devicechange'));

    return this.emulatedDevices.splice(index, 1)[0];
}

async function newEnumerateDevices(this: MediaDevices) {
    const realDevices = await originalEnumerateDevices.call(this);

    if (!this.emulatedDevices) {
        return realDevices;
    }

    return this.emulatedDevices.concat(realDevices);
}

function newGetUserMedia(
    this: MediaDevices,
    constraints?: MediaStreamConstraints | EmulatedMediaStreamConstraints,
) {
    if (isEmulatedMediaStreamConstraints(constraints)) {
        return evaluateConstraints(this.emulatedDevices, constraints);
    }

    return originalGetUserMedia.call(this, constraints);
}

function newGetDisplayMedia(
    this: MediaDevices,
    constraints?: DisplayMediaStreamConstraints | EmulatedMediaStreamConstraints,
) {
    if (isEmulatedMediaStreamConstraints(constraints)) {
        return evaluateConstraints(this.emulatedDevices, constraints);
    }

    return originalGetDisplayMedia.call(this, constraints);
}

HTMLAudioElement.prototype.setSinkId = newSetSinkId;
MediaDevices.prototype.addEmulatedDevice = addEmulatedDevice;
MediaDevices.prototype.removeEmulatedDevice = removeEmulatedDevice;
MediaDevices.prototype.enumerateDevices = newEnumerateDevices;
MediaDevices.prototype.getUserMedia = newGetUserMedia;
MediaDevices.prototype.getDisplayMedia = newGetDisplayMedia;
