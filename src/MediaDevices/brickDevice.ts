function brickDevice(this: MediaDevices, emulatorDeviceId: string) {
    const deviceMeta = this.meta?.[emulatorDeviceId];

    if (!deviceMeta) {
        return false;
    }

    deviceMeta.tracks.forEach((track) => track.stop());
    deviceMeta.bricked = true;
    deviceMeta.tracks.length = 0;

    return true;
}

MediaDevices.prototype.brickDevice = brickDevice;

export {};
