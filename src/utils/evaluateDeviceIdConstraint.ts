function evaluateDeviceIdConstraint(
    realConstraints: DisplayMediaStreamConstraints | MediaStreamConstraints,
    emulatedConstraints: DisplayMediaStreamConstraints | MediaStreamConstraints,
    kind: 'audio' | 'video',
    meta: EmulatedDeviceMeta,
) {
    const constraints = <MediaTrackConstraints | undefined>realConstraints[kind];

    const deviceId = <string | undefined>(
        (<ConstrainDOMStringParameters | undefined>constraints?.deviceId)?.exact
    );

    if (!deviceId) return;

    const deviceMeta = meta[deviceId];

    if (!deviceMeta) return;

    if (deviceMeta.device.kind !== `${kind}input`) {
        throw new OverconstrainedError('deviceId', `Invalid deviceId`);
    }

    if (deviceMeta.bricked) {
        throw new TypeError(`NotReadableError: Failed to allocate ${kind}source`);
    }

    // eslint-disable-next-line no-param-reassign
    emulatedConstraints[kind] = {
        ...constraints,
        deviceId,
    };

    // eslint-disable-next-line no-param-reassign
    delete realConstraints[kind];
}

export default evaluateDeviceIdConstraint;
