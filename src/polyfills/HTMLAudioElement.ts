/* eslint-disable @typescript-eslint/unbound-method */
const originalSetSinkId = HTMLAudioElement.prototype.setSinkId;
/* eslint-enable @typescript-eslint/unbound-method */

class NewHTMLAudioElement {
    async setSinkId(this: HTMLAudioElement, sinkId: string) {
        const deviceMeta = navigator.mediaDevices.meta?.[sinkId];

        if (deviceMeta?.device.kind === 'audiooutput') {
            this.sinkId = sinkId;

            return;
        }

        await originalSetSinkId.call(this, sinkId);
    }
}

/* eslint-disable @typescript-eslint/unbound-method */
HTMLAudioElement.prototype.setSinkId = NewHTMLAudioElement.prototype.setSinkId;
/* eslint-enable @typescript-eslint/unbound-method */

export {};
