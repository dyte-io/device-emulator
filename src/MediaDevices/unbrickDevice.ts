function unbrickDevice(this: MediaDevices, emulatorDeviceId: string) {
    const deviceMeta = this.meta?.[emulatorDeviceId];

    if (!deviceMeta) {
        return false;
    }

    deviceMeta.bricked = false;

    return true;
}

MediaDevices.prototype.unbrickDevice = unbrickDevice;

export {};
