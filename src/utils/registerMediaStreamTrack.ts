import createAudioStream from './createAudioStream';
import createVideoStream from './createVideoStream';
import evaluateFacingModeConstraint from './evaluateFacingModeConstraint';
import evaluateGroupIdConstraint from './evaluateGroupIdConstraint';
import extractTrack from './extractTrack';

async function registerMediaStreamTrack(
    mediaStream: MediaStream,
    constraints: DisplayMediaStreamConstraints | MediaStreamConstraints,
    kind: 'audio' | 'video',
    meta: EmulatedDeviceMeta,
) {
    const realConstraints = <MediaTrackConstraints>constraints[kind];
    const deviceId = <string>realConstraints.deviceId;
    const props = meta[deviceId]!;
    const stream = (kind === 'audio' ? createAudioStream : createVideoStream)(props);
    const track = extractTrack(stream);
    const emulatedConstraints: MediaTrackConstraints = { deviceId: { exact: deviceId } };
    const allFacingModes = (<InputDeviceInfo>props.device).getCapabilities().facingMode;

    evaluateFacingModeConstraint(realConstraints, emulatedConstraints, props);
    evaluateGroupIdConstraint(realConstraints, emulatedConstraints, props);

    delete realConstraints.deviceId;

    const originalConstraints = track.getConstraints();

    await track.applyConstraints({ ...originalConstraints, ...realConstraints });

    const getConstraints = track.getConstraints.bind(track);
    const getSettings = track.getSettings.bind(track);
    const getCapabilities = track.getCapabilities.bind(track);
    const applyConstraints = track.applyConstraints.bind(track);

    track.getConstraints = () => ({
        ...getConstraints(),
        ...emulatedConstraints,
    });

    track.getSettings = () => {
        const facingModeConstraint = <ConstrainDOMStringParameters | undefined>(
            emulatedConstraints.facingMode
        );

        const defaultFacingMode = allFacingModes ? allFacingModes[0] : undefined;

        return {
            ...getSettings(),
            deviceId,
            groupId: props.device.groupId,
            facingMode: facingModeConstraint
                ? <string>facingModeConstraint.exact
                : defaultFacingMode,
        };
    };

    track.getCapabilities = () => ({
        ...getCapabilities(),
        deviceId,
        facingMode: allFacingModes,
        groupId: props.device.groupId,
    });

    track.applyConstraints = async (mediaTrackConstraints?: MediaTrackConstraints) => {
        Object.keys(emulatedConstraints).forEach((constraint) => {
            delete emulatedConstraints[<keyof MediaTrackConstraints>constraint];
        });

        if (!mediaTrackConstraints) {
            await applyConstraints(mediaTrackConstraints);

            return;
        }

        const deviceIdConstraint = (<ConstrainDOMStringParameters | undefined>(
            mediaTrackConstraints.deviceId
        ))?.exact;

        if (deviceIdConstraint) {
            if (deviceIdConstraint !== deviceId) {
                throw new OverconstrainedError('deviceId', `Invalid deviceId`);
            }

            delete mediaTrackConstraints.deviceId;

            emulatedConstraints.deviceId = { exact: deviceId };
        }

        evaluateFacingModeConstraint(mediaTrackConstraints, emulatedConstraints, props);
        evaluateGroupIdConstraint(mediaTrackConstraints, emulatedConstraints, props);

        await applyConstraints(mediaTrackConstraints);
    };

    props.tracks.push(track);
    mediaStream.addTrack(track);
}

export default registerMediaStreamTrack;
