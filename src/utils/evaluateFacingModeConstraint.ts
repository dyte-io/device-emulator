function evaluateFacingModeConstraint(
    realConstraints: MediaTrackConstraints,
    emulatedConstraints: MediaTrackConstraints,
    props: EmulatedDeviceMetaProps,
) {
    const allFacingModes = (<InputDeviceInfo>props.device).getCapabilities().facingMode;

    const facingMode = <string | undefined>(
        (<ConstrainDOMStringParameters | undefined>realConstraints.facingMode)?.exact
    );

    if (facingMode) {
        if (!allFacingModes || !allFacingModes.includes(facingMode)) {
            throw new OverconstrainedError('facingMode', `Invalid facingMode`);
        }

        emulatedConstraints.facingMode = { exact: facingMode };

        delete realConstraints.facingMode;
    }
}

export default evaluateFacingModeConstraint;
