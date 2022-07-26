import extractConstraintProperty from './extractConstraintProperty';

function evaluateFacingModeConstraint(
    realConstraints: MediaTrackConstraints,
    emulatedConstraints: MediaTrackConstraints,
    props: EmulatedDeviceMetaProps,
) {
    const allFacingModes = (<InputDeviceInfo>props.device).getCapabilities().facingMode;
    const facingMode = extractConstraintProperty<string>(realConstraints, 'facingMode');

    if (allFacingModes?.includes(facingMode!)) {
        emulatedConstraints.facingMode = realConstraints.facingMode;

        delete realConstraints.facingMode;
    }
}

export default evaluateFacingModeConstraint;
