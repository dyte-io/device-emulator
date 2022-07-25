function evaluateGroupIdConstraint(
    realConstraints: MediaTrackConstraints,
    emulatedConstraints: MediaTrackConstraints,
    props: EmulatedDeviceMetaProps,
) {
    const groupId = <string | undefined>(
        (<ConstrainDOMStringParameters | undefined>realConstraints.groupId)?.exact
    );

    if (groupId) {
        if (groupId !== props.device.groupId) {
            throw new OverconstrainedError('groupId', `Invalid groupId`);
        }

        emulatedConstraints.groupId = { exact: groupId };

        delete realConstraints.groupId;
    }
}

export default evaluateGroupIdConstraint;
