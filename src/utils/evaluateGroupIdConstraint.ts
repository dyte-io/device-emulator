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

        // eslint-disable-next-line no-param-reassign
        emulatedConstraints.groupId = { exact: groupId };

        // eslint-disable-next-line no-param-reassign
        delete realConstraints.groupId;
    }
}

export default evaluateGroupIdConstraint;
