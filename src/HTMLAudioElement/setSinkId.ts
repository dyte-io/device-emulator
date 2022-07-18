// eslint-disable-next-line @typescript-eslint/unbound-method
const originalSetSinkId = HTMLAudioElement.prototype.setSinkId;

function newSetSinkId(this: HTMLAudioElement, sinkId: string) {
    const deviceMeta = navigator.mediaDevices.meta?.[sinkId];

    if (deviceMeta) {
        if (deviceMeta.device.kind !== 'audiooutput') {
            return Promise.reject(new TypeError('NotFoundError: Requested device not found'));
        }

        this.sinkId = sinkId;

        return Promise.resolve();
    }

    return originalSetSinkId.call(this, sinkId);
}

HTMLAudioElement.prototype.setSinkId = newSetSinkId;

export {};
