function createAudioStreamTrack(props: EmulatedDeviceMetaProps) {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const dest = ctx.createMediaStreamDestination();

    osc.connect(gain);
    gain.connect(dest);
    osc.start();

    setInterval(() => {
        if (gain.gain.value !== +!props.silent) {
            gain.gain.value = +!props.silent;
        }
    });

    return dest.stream;
}

export default createAudioStreamTrack;
