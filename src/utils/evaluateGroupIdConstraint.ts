import extractConstraintProperty from './extractConstraintProperty';

function evaluateGroupIdConstraint(
    realConstraints: MediaTrackConstraints,
    emulatedConstraints: MediaTrackConstraints,
    props: EmulatedDeviceMetaProps,
) {
    const groupId = extractConstraintProperty<string>(realConstraints, 'groupId');

    if (groupId === props.device.groupId) {
        emulatedConstraints.groupId = realConstraints.groupId;

        delete realConstraints.groupId;
    }
}

export default evaluateGroupIdConstraint;
