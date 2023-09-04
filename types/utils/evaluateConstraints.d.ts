declare function evaluateConstraints(originalFn: typeof MediaDevices.prototype.getDisplayMedia | typeof MediaDevices.prototype.getUserMedia, realConstraints: MediaStreamConstraints, meta: EmulatedDeviceMeta): Promise<MediaStream>;
export default evaluateConstraints;
