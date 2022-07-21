import extractTrack from '../utils/extractTrack';

function createVideoStream() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new TypeError('UnknownError: an unknown error occurred');
    }

    return canvas.captureStream();
}

const videoStream = createVideoStream();
const videoTrack = extractTrack(videoStream);
const videoCapabilities = videoTrack.getCapabilities();

videoTrack.stop();

MediaDevices.prototype.videoCapabilities = videoCapabilities;
