import extractConstraintProperty from './extractConstraintProperty';

function extractDeviceId(constraints: MediaTrackConstraints, replace?: MediaTrackConstraints) {
    const extractLegacyDeviceId = (key: 'mandatory' | 'optional') => {
        if (!constraints[key]) {
            return null;
        }

        if (Array.isArray(constraints[key])) {
            const legacyDeviceIdIndex = (<LegacyMediaTrackConstraints[]>constraints[key]).findIndex(
                (c) => c.sourceId,
            );

            if (legacyDeviceIdIndex === -1) {
                return null;
            }

            const legacyDeviceId = (<LegacyMediaTrackConstraints[]>constraints[key])[
                legacyDeviceIdIndex
            ];

            const { sourceId } = legacyDeviceId;

            if (replace) {
                if (Object.keys(legacyDeviceId).length === 1) {
                    replace[key] = (<LegacyMediaTrackConstraints[]>constraints[key]).splice(
                        legacyDeviceIdIndex,
                        1,
                    );
                } else {
                    replace[key] = [{ sourceId: legacyDeviceId.sourceId }];

                    delete legacyDeviceId.sourceId;
                }
            }

            return sourceId;
        }

        const legacyDeviceId = <LegacyMediaTrackConstraints>constraints[key];
        const { sourceId } = legacyDeviceId;

        if (!sourceId) {
            return null;
        }

        if (replace) {
            replace[key] = { sourceId: legacyDeviceId.sourceId };

            delete legacyDeviceId.sourceId;
        }

        return sourceId;
    };

    const mandatoryLegacyDeviceId = extractLegacyDeviceId('mandatory');

    if (mandatoryLegacyDeviceId) {
        return mandatoryLegacyDeviceId;
    }

    const optionalLegacyDeviceId = extractLegacyDeviceId('optional');

    if (optionalLegacyDeviceId) {
        return optionalLegacyDeviceId;
    }

    const deviceId = extractConstraintProperty<string>(constraints, 'deviceId');

    if (replace) {
        replace.deviceId = constraints.deviceId;

        delete constraints.deviceId;
    }

    return deviceId;
}

export default extractDeviceId;
