import extractTrack from '../utils/extractTrack';

function createAudioStream() {
    const ctx = new AudioContext();
    const dest = ctx.createMediaStreamDestination();

    return dest.stream;
}

const audioStream = createAudioStream();
const audioTrack = extractTrack(audioStream);
const audioCapabilities = audioTrack.getCapabilities();

audioTrack.stop();

MediaDevices.prototype.audioCapabilities = audioCapabilities;
