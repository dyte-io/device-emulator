// eslint-disable-next-line @typescript-eslint/unbound-method
const originalEnumerateDevices = MediaDevices.prototype.enumerateDevices;

async function newEnumerateDevices(this: MediaDevices) {
    const realDevices = await originalEnumerateDevices.call(this);

    if (!this.meta) {
        return realDevices;
    }

    const deviceIds = Object.keys(this.meta);

    const emulatedDevices = deviceIds.map(
        (deviceId) => (<EmulatedDeviceMetaProps>(<EmulatedDeviceMeta>this.meta)[deviceId]).device,
    );

    return emulatedDevices.concat(realDevices);
}

MediaDevices.prototype.enumerateDevices = newEnumerateDevices;

export {};
