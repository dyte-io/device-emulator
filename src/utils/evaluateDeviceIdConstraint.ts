import extractDeviceId from './extractDeviceId';

function evaluateDeviceIdConstraint(
    realConstraints: DisplayMediaStreamConstraints | MediaStreamConstraints,
    emulatedConstraints: DisplayMediaStreamConstraints | MediaStreamConstraints,
    kind: 'audio' | 'video',
    meta: EmulatedDeviceMeta,
) {
    const constraints = <MediaTrackConstraints | undefined>realConstraints[kind];

    if (!constraints) {
        return;
    }

    const deviceId = extractDeviceId(constraints);

    if (!deviceId) {
        return;
    }

    const deviceMeta = meta[deviceId];

    if (!deviceMeta) {
        return;
    }

    if (deviceMeta.device.kind !== `${kind}input`) {
        throw new OverconstrainedError('deviceId', `Invalid deviceId`);
    }

    if (deviceMeta.bricked) {
        throw new TypeError(`NotReadableError: Failed to allocate ${kind}source`);
    }

    emulatedConstraints[kind] = realConstraints[kind];

    delete realConstraints[kind];
}

export default evaluateDeviceIdConstraint;
