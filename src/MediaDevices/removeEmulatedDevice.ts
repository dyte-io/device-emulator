function removeEmulatedDevice(this: MediaDevices, emulatorDeviceId: string) {
    const deviceMeta = this.meta?.[emulatorDeviceId];

    if (!deviceMeta) {
        return false;
    }

    deviceMeta.tracks.forEach((track) => track.stop());
    delete (<EmulatedDeviceMeta>this.meta)[emulatorDeviceId];
    this.dispatchEvent(new Event('devicechange'));

    return true;
}

MediaDevices.prototype.removeEmulatedDevice = removeEmulatedDevice;

export {};
