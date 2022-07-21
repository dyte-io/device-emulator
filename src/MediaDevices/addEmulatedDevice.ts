function addEmulatedDevice(
    this: MediaDevices,
    kind: MediaDeviceKind,
    capabilities?: EmulatedVideoDeviceCapabilities | EmulatedAudioDeviceCapabilities,
) {
    const deviceId = crypto.randomUUID();
    const label = `Emulated device of ${kind} kind - ${deviceId}`;
    const groupId = 'emulated-device-group';
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
        device,
    };

    if (!this.meta) {
        this.meta = { [device.deviceId]: meta };
    } else {
        this.meta[device.deviceId] = meta;
    }

    this.dispatchEvent(new Event('devicechange'));

    return deviceId;
}

MediaDevices.prototype.addEmulatedDevice = addEmulatedDevice;

export {};
