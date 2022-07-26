import deepmerge from 'deepmerge';
import createAudioStream from './createAudioStream';
import createVideoStream from './createVideoStream';
import evaluateFacingModeConstraint from './evaluateFacingModeConstraint';
import evaluateGroupIdConstraint from './evaluateGroupIdConstraint';
import extractConstraintProperty from './extractConstraintProperty';
import extractDeviceId from './extractDeviceId';
import extractTrack from './extractTrack';

async function registerMediaStreamTrack(
    mediaStream: MediaStream,
    constraints: DisplayMediaStreamConstraints | MediaStreamConstraints,
    kind: 'audio' | 'video',
    meta: EmulatedDeviceMeta,
) {
    const realConstraints = <MediaTrackConstraints>constraints[kind];
    let emulatedConstraints: MediaTrackConstraints = {};
    const deviceId = extractDeviceId(realConstraints, emulatedConstraints)!;
    const props = meta[deviceId]!;
    const stream = (kind === 'audio' ? createAudioStream : createVideoStream)(props);
    const track = extractTrack(stream);
    const allFacingModes = (<InputDeviceInfo>props.device).getCapabilities().facingMode;

    evaluateFacingModeConstraint(realConstraints, emulatedConstraints, props);
    evaluateGroupIdConstraint(realConstraints, emulatedConstraints, props);

    const originalConstraints = track.getConstraints();

    await track.applyConstraints(deepmerge(originalConstraints, realConstraints));

    const getConstraints = track.getConstraints.bind(track);
    const getSettings = track.getSettings.bind(track);
    const getCapabilities = track.getCapabilities.bind(track);
    const applyConstraints = track.applyConstraints.bind(track);

    track.getConstraints = () => deepmerge(getConstraints(), emulatedConstraints);

    track.getSettings = () => {
        const facingModeConstraint = extractConstraintProperty<string>(
            emulatedConstraints,
            'facingMode',
        );

        const defaultFacingMode = allFacingModes ? allFacingModes[0] : undefined;

        return {
            ...getSettings(),
            deviceId,
            groupId: props.device.groupId,
            facingMode: facingModeConstraint ?? defaultFacingMode,
        };
    };

    track.getCapabilities = () => ({
        ...getCapabilities(),
        deviceId,
        facingMode: allFacingModes,
        groupId: props.device.groupId,
    });

    track.applyConstraints = async (mediaTrackConstraints?: MediaTrackConstraints) => {
        const newEmulatedConstraints = {};

        if (!mediaTrackConstraints) {
            await applyConstraints(mediaTrackConstraints);

            emulatedConstraints = newEmulatedConstraints;

            return;
        }

        const deviceIdConstraint = extractDeviceId(mediaTrackConstraints, newEmulatedConstraints);

        if (deviceIdConstraint) {
            if (deviceIdConstraint !== deviceId) {
                throw new OverconstrainedError('deviceId', `Invalid deviceId`);
            }
        }

        evaluateFacingModeConstraint(mediaTrackConstraints, newEmulatedConstraints, props);
        evaluateGroupIdConstraint(mediaTrackConstraints, newEmulatedConstraints, props);

        await applyConstraints(mediaTrackConstraints);

        emulatedConstraints = newEmulatedConstraints;
    };

    props.tracks.push(track);
    mediaStream.addTrack(track);
}

export default registerMediaStreamTrack;
