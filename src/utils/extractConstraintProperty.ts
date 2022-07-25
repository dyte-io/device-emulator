function extractConstraintProperty<T>(
    constraints: MediaTrackConstraints,
    property: keyof MediaTrackConstraints,
) {
    const exactProperty = (<{ exact?: T } | undefined>constraints[property])?.exact;
    const idealProperty = (<{ ideal?: T } | undefined>constraints[property])?.ideal;
    const p = <T | undefined>constraints[property];

    return exactProperty ?? idealProperty ?? p;
}

export default extractConstraintProperty;
