import evaluateDeviceIdConstraint from './evaluateDeviceIdConstraint';
import registerMediaStreamTrack from './registerMediaStreamTrack';

async function evaluateConstraints(
    originalFn:
        | typeof MediaDevices.prototype.getDisplayMedia
        | typeof MediaDevices.prototype.getUserMedia,
    realConstraints: MediaStreamConstraints,
    meta: EmulatedDeviceMeta,
) {
    const emulatedConstraints: MediaStreamConstraints = {};

    const audioDeviceId = evaluateDeviceIdConstraint(
        realConstraints,
        emulatedConstraints,
        'audio',
        meta,
    );

    const videoDeviceId = evaluateDeviceIdConstraint(
        realConstraints,
        emulatedConstraints,
        'video',
        meta,
    );

    if (Object.keys(emulatedConstraints).length === 0) {
        const stream = await originalFn(realConstraints);

        return stream;
    }

    const mediaStream = new MediaStream();

    if (audioDeviceId) {
        await registerMediaStreamTrack(
            audioDeviceId,
            mediaStream,
            emulatedConstraints,
            'audio',
            meta,
        );
    }

    if (videoDeviceId) {
        await registerMediaStreamTrack(
            videoDeviceId,
            mediaStream,
            emulatedConstraints,
            'video',
            meta,
        );
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
