declare function registerMediaStreamTrack(deviceId: string, mediaStream: MediaStream, constraints: MediaStreamConstraints, kind: 'audio' | 'video', meta: EmulatedDeviceMeta): Promise<void>;
export default registerMediaStreamTrack;
