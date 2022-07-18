import evaluateDeviceIdConstraint from './evaluateDeviceIdConstraint';
import registerMediaStreamTrack from './registerMediaStreamTrack';

async function evaluateConstraints(
    originalFn:
        | typeof MediaDevices.prototype.getDisplayMedia
        | typeof MediaDevices.prototype.getUserMedia,
    realConstraints: DisplayMediaStreamConstraints | MediaStreamConstraints,
    meta: EmulatedDeviceMeta,
) {
    const emulatedConstraints: DisplayMediaStreamConstraints | MediaStreamConstraints = {};

    evaluateDeviceIdConstraint(realConstraints, emulatedConstraints, 'audio', meta);
    evaluateDeviceIdConstraint(realConstraints, emulatedConstraints, 'video', meta);

    if (Object.keys(emulatedConstraints).length === 0) {
        const stream = await originalFn(realConstraints);

        return stream;
    }

    const mediaStream = new MediaStream();

    if (emulatedConstraints.audio) {
        await registerMediaStreamTrack(mediaStream, 'audio', emulatedConstraints, meta);
    }

    if (emulatedConstraints.video) {
        await registerMediaStreamTrack(mediaStream, 'video', emulatedConstraints, meta);
    }

    if (realConstraints.audio || realConstraints.video) {
        const stream = await originalFn(realConstraints);

        stream.getTracks().forEach((track) => {
            mediaStream.addTrack(track);
        });
    }

    return mediaStream;
}

export default evaluateConstraints;
