function createAudioStream(props: EmulatedDeviceMetaProps) {
    const ctx = new AudioContext();
    const osc = new OscillatorNode(ctx);
    const gain = new GainNode(ctx, { gain: +!props.silent });
    const dest = new MediaStreamAudioDestinationNode(ctx);

    osc.connect(gain);
    gain.connect(dest);
    osc.start();

    props.eventTarget.addEventListener('toggleSilence', () => {
        gain.gain.value = +!props.silent;
    });

    return dest.stream;
}

export default createAudioStream;
