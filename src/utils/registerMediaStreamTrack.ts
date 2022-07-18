import createAudioStreamTrack from './createAudioStream';
import createVideoStreamTrack from './createVideoStream';

async function registerMediaStreamTrack(
    mediaStream: MediaStream,
    kind: 'audio' | 'video',
    constraints: DisplayMediaStreamConstraints | MediaStreamConstraints,
    meta: EmulatedDeviceMeta,
) {
    const realConstraints = <MediaTrackConstraints>constraints[kind];
    const deviceId = <string>realConstraints.deviceId;
    const props = <EmulatedDeviceMetaProps>meta[deviceId];
    const stream = (kind === 'audio' ? createAudioStreamTrack : createVideoStreamTrack)(props);
    const tracks = stream.getTracks();

    if (tracks.length !== 1) {
        throw new TypeError('UnknownError: an unknown error occurred');
    }

    const track = tracks[0];
    const emulatedConstraints: MediaTrackConstraints = {};
    const allFacingModes = (<InputDeviceInfo>props.device).getCapabilities().facingMode;

    const facingMode = <string | undefined>(
        (<ConstrainDOMStringParameters | undefined>realConstraints.facingMode)?.exact
    );

    const groupId = <string | undefined>(
        (<ConstrainDOMStringParameters | undefined>realConstraints.groupId)?.exact
    );

    if (groupId) {
        if (groupId !== props.device.groupId) {
            throw new OverconstrainedError('groupId', `Invalid ${kind} group ID`);
        }

        emulatedConstraints.groupId = groupId;

        delete realConstraints.groupId;
    }

    if (facingMode) {
        if (!allFacingModes || !allFacingModes.includes(facingMode)) {
            throw new OverconstrainedError('facingMode', `Invalid ${kind} facing mode`);
        }

        emulatedConstraints.facingMode = facingMode;

        delete realConstraints.facingMode;
    }

    delete realConstraints.deviceId;

    const originalConstraints = track.getConstraints();

    await track.applyConstraints({ ...originalConstraints, ...realConstraints });

    const getConstraints = track.getConstraints.bind(track);
    const getSettings = track.getSettings.bind(track);
    const getCapabilities = track.getCapabilities.bind(track);

    track.getConstraints = () => ({
        ...getConstraints(),
        ...emulatedConstraints,
        deviceId,
    });

    track.getSettings = () => ({
        ...getSettings(),
        deviceId,
        groupId: props.device.groupId,
        facingMode: facingMode || (allFacingModes ? allFacingModes[0] : undefined),
    });

    track.getCapabilities = () => ({
        ...getCapabilities(),
        deviceId,
        facingMode: allFacingModes,
        groupId: props.device.groupId,
    });

    props.tracks.push(track);
    mediaStream.addTrack(track);
}

export default registerMediaStreamTrack;
