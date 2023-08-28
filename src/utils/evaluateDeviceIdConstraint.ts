import extractDeviceId from './extractDeviceId';

function evaluateDeviceIdConstraint(
    realConstraints: DisplayMediaStreamConstraints | MediaStreamConstraints,
    emulatedConstraints: DisplayMediaStreamConstraints | MediaStreamConstraints,
    kind: 'audio' | 'video',
    meta: EmulatedDeviceMeta,
) {
    const constraints = <MediaTrackConstraints | undefined>realConstraints[kind];

    if (!constraints) {
        return null;
    }

    const deviceId = extractDeviceId(constraints);

    if (!deviceId) {
        return null;
    }

    const deviceMeta = meta[deviceId];

    if (deviceMeta?.device.kind !== `${kind}input`) {
        return null;
    }

    if (deviceMeta.fail) {
        throw new TypeError(`NotReadableError: Failed to allocate ${kind}source`);
    }

    emulatedConstraints[kind] = realConstraints[kind];

    delete realConstraints[kind];

    return deviceId;
}

export default evaluateDeviceIdConstraint;
