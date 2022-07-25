import extractConstraintProperty from './extractConstraintProperty';

function evaluateGroupIdConstraint(
    realConstraints: MediaTrackConstraints,
    emulatedConstraints: MediaTrackConstraints,
    props: EmulatedDeviceMetaProps,
) {
    const groupId = extractConstraintProperty<string>(realConstraints, 'groupId');

    if (groupId) {
        if (groupId !== props.device.groupId) {
            throw new OverconstrainedError('groupId', `Invalid groupId`);
        }

        emulatedConstraints.groupId = realConstraints.groupId;

        delete realConstraints.groupId;
    }
}

export default evaluateGroupIdConstraint;
