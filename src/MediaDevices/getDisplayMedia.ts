import evaluateConstraints from '../utils/evaluateConstraints';

// eslint-disable-next-line @typescript-eslint/unbound-method
const originalGetDisplayMedia = MediaDevices.prototype.getDisplayMedia;

function newGetDisplayMedia(this: MediaDevices, constraints?: DisplayMediaStreamConstraints) {
    const originalFn = originalGetDisplayMedia.bind(this);

    if (!constraints || !this.meta) {
        return originalFn(constraints);
    }

    if (!constraints.video) {
        // eslint-disable-next-line no-param-reassign
        constraints.video = true;
    }

    return evaluateConstraints(originalFn, constraints, this.meta);
}

MediaDevices.prototype.getDisplayMedia = newGetDisplayMedia;
