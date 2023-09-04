declare function extractConstraintProperty<T>(constraints: MediaTrackConstraints, property: keyof MediaTrackConstraints): T | undefined;
export default extractConstraintProperty;
