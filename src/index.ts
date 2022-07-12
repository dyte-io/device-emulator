const isEmulatedMediaStreamConstraints = (
    constraints?:
        | MediaStreamConstraints
        | DisplayMediaStreamConstraints
        | EmulatedMediaStreamConstraints,
): constraints is EmulatedMediaStreamConstraints =>
    !!(<EmulatedMediaStreamConstraints | undefined>constraints)?.emulated;

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
    capabilities?: Omit<Omit<MediaTrackCapabilities, 'deviceId'>, 'groupId'>,
) {
    if (!this.emulatedDevices) {
        this.emulatedDevices = [];
    }

    const groupId = 'emulated-device-group';
    const deviceId = crypto.randomUUID();
    const label = `Emulated device of kind \`${kind}\``;
    const device = { deviceId, kind, label, groupId, toJSON: () => device };

    if (kind.endsWith('input')) {
        Object.setPrototypeOf(device, InputDeviceInfo.prototype);

        (<InputDeviceInfo>device).getCapabilities = () => ({
            ...capabilities,
            deviceId: device.deviceId,
            groupId: device.groupId,
        });
    } else {
        Object.setPrototypeOf(device, MediaDeviceInfo.prototype);
    }

    this.emulatedDevices.push(device);

    return deviceId;
}

function removeEmulatedDevice(this: MediaDevices, emulatorDeviceId: string) {
    if (!this.emulatedDevices) {
        this.emulatedDevices = [];
    }

    const index = this.emulatedDevices.findIndex((device) => device.deviceId === emulatorDeviceId);

    if (index === -1) {
        return undefined;
    }

    return this.emulatedDevices.splice(index, 1)[0];
}

async function newEnumerateDevices(this: MediaDevices) {
    if (!this.emulatedDevices) {
        this.emulatedDevices = [];
    }

    const realDevices = await originalEnumerateDevices.call(this);

    return this.emulatedDevices.concat(realDevices);
}

function newGetUserMedia(
    this: MediaDevices,
    constraints?: MediaStreamConstraints | EmulatedMediaStreamConstraints,
) {
    if (isEmulatedMediaStreamConstraints(constraints)) {
        return Promise.resolve(new MediaStream());
    }

    return originalGetUserMedia.call(this, constraints);
}

function newGetDisplayMedia(
    this: MediaDevices,
    constraints?: DisplayMediaStreamConstraints | EmulatedMediaStreamConstraints,
) {
    if (isEmulatedMediaStreamConstraints(constraints)) {
        return Promise.resolve(new MediaStream());
    }

    return originalGetDisplayMedia.call(this, constraints);
}

HTMLAudioElement.prototype.setSinkId = newSetSinkId;
MediaDevices.prototype.addEmulatedDevice = addEmulatedDevice;
MediaDevices.prototype.removeEmulatedDevice = removeEmulatedDevice;
MediaDevices.prototype.enumerateDevices = newEnumerateDevices;
MediaDevices.prototype.getUserMedia = newGetUserMedia;
MediaDevices.prototype.getDisplayMedia = newGetDisplayMedia;
