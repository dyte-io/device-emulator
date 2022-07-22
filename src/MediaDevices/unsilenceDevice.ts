function unsilenceDevice(this: MediaDevices, emulatorDeviceId: string) {
    const deviceMeta = this.meta?.[emulatorDeviceId];

    if (!deviceMeta) {
        return false;
    }

    deviceMeta.silent = false;

    deviceMeta.eventTarget.dispatchEvent(new Event('toggleSilence'));

    return true;
}

MediaDevices.prototype.unsilenceDevice = unsilenceDevice;

export {};
