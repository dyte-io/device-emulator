declare function evaluateDeviceIdConstraint(realConstraints: DisplayMediaStreamConstraints | MediaStreamConstraints, emulatedConstraints: DisplayMediaStreamConstraints | MediaStreamConstraints, kind: 'audio' | 'video', meta: EmulatedDeviceMeta): string | null;
export default evaluateDeviceIdConstraint;
