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

        const { height, width, frameRate, facingMode, ...defaultCapabilities } =
            kind === 'audioinput' ? this.audioCapabilities : this.videoCapabilities;

        const otherCapabilities = {
            height: {
                max: capabilities?.height?.max ?? height?.max,
                min: height?.min,
            },
            width: {
                max: capabilities?.width?.max ?? width?.max,
                min: width?.min,
            },
            frameRate: {
                max: capabilities?.frameRate?.max ?? frameRate?.max,
                min: frameRate?.min,
            },
            facingMode: capabilities?.facingMode ?? facingMode,
        };

        (<InputDeviceInfo>device).getCapabilities = () => ({
            ...defaultCapabilities,
            ...otherCapabilities,
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
