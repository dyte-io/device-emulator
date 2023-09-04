declare function evaluateDeviceIdConstraint(realConstraints: MediaStreamConstraints, emulatedConstraints: MediaStreamConstraints, kind: 'audio' | 'video', meta: EmulatedDeviceMeta): string | null;
export default evaluateDeviceIdConstraint;
