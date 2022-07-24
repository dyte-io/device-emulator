import extractTrack from './extractTrack';

function getEmulatedAudioDeviceCapabilities() {
    const ctx = new AudioContext();
    const { stream: audioStream } = new MediaStreamAudioDestinationNode(ctx);
    const audioTrack = extractTrack(audioStream);
    const audioCapabilities = audioTrack.getCapabilities();

    audioTrack.stop();

    return audioCapabilities;
}

export default getEmulatedAudioDeviceCapabilities;
