class DeviceEmulatorHelper {
    addDevice(kind: 'audioinput' | 'audiooutput' | 'videoinput', capabilities?: MediaTrackCapabilities) {
        if (kind === 'audioinput') {
            return navigator.mediaDevices.addEmulatedDevice(kind as 'audioinput');
        }

        if (kind === 'audiooutput') {
            return navigator.mediaDevices.addEmulatedDevice(kind as 'audiooutput');
        }

        if (kind === 'videoinput') {
            return navigator.mediaDevices.addEmulatedDevice(kind as 'videoinput', capabilities);
        }
    }

    removeDevice(deviceId: string) {
        return navigator.mediaDevices.removeEmulatedDevice(deviceId);
    }

    toggleSilence(deviceId: string) {
        const meta = this.getDeviceMeta(deviceId);
        if (meta) {
            return navigator.mediaDevices.silenceDevice(deviceId, !meta.silent);
        }
    }

    toggleFailDevice(deviceId: string) {
        const meta = this.getDeviceMeta(deviceId);
        if (meta) {
            return navigator.mediaDevices.failDevice(deviceId, !meta.fail);
        }
    }

    getDeviceMeta(deviceId: string) {
        return navigator.mediaDevices.meta ? navigator.mediaDevices.meta[deviceId] : undefined;
    }

    isVirtualDevice(device: MediaDeviceInfo) {
        return navigator.mediaDevices.meta !== undefined 
            && navigator.mediaDevices.meta[device.deviceId] !== undefined
            && device.label.startsWith('Emulated device of');
    }
}

export default new DeviceEmulatorHelper();