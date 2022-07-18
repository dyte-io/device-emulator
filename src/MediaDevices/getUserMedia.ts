import evaluateConstraints from '../utils/evaluateConstraints';

// eslint-disable-next-line @typescript-eslint/unbound-method
const originalGetUserMedia = MediaDevices.prototype.getUserMedia;

function newGetUserMedia(this: MediaDevices, constraints?: MediaStreamConstraints) {
    const originalFn = originalGetUserMedia.bind(this);

    if (!constraints || !this.meta) {
        return originalFn(constraints);
    }

    return evaluateConstraints(originalFn, constraints, this.meta);
}

MediaDevices.prototype.getUserMedia = newGetUserMedia;
