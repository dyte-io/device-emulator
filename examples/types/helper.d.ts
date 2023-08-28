declare class DeviceEmulatorHelper {
    addDevice(kind: 'audioinput' | 'audiooutput' | 'videoinput', capabilities?: MediaTrackCapabilities): any;
    removeDevice(deviceId: string): any;
    toggleSilence(deviceId: string): any;
    toggleBrickDevice(deviceId: string): any;
    getDeviceMeta(deviceId: string): any;
    isVirtualDevice(device: MediaDeviceInfo): boolean;
}
declare const _default: DeviceEmulatorHelper;
export default _default;
