import extractConstraintProperty from './extractConstraintProperty';

function evaluateFacingModeConstraint(
    realConstraints: MediaTrackConstraints,
    emulatedConstraints: MediaTrackConstraints,
    props: EmulatedDeviceMetaProps,
) {
    const allFacingModes = (<InputDeviceInfo>props.device).getCapabilities().facingMode;
    const facingMode = extractConstraintProperty<string>(realConstraints, 'facingMode');

    if (facingMode) {
        if (!allFacingModes || !allFacingModes.includes(facingMode)) {
            throw new OverconstrainedError('facingMode', `Invalid facingMode`);
        }

        emulatedConstraints.facingMode = realConstraints.facingMode;

        delete realConstraints.facingMode;
    }
}

export default evaluateFacingModeConstraint;
