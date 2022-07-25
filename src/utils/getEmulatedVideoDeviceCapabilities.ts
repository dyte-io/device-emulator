import extractTrack from './extractTrack';

function getEmulatedVideoDeviceCapabilities() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new TypeError('UnknownError: an unknown error occurred');
    }

    const videoStream = canvas.captureStream();
    const videoTrack = extractTrack(videoStream);
    const videoCapabilities = videoTrack.getCapabilities();

    videoTrack.stop();

    return videoCapabilities;
}

export default getEmulatedVideoDeviceCapabilities;
