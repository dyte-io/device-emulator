function createVideoStream(props: EmulatedDeviceMetaProps) {
    const canvas = document.createElement('canvas');
    const capabilities = (<InputDeviceInfo>props.device).getCapabilities();

    canvas.width = capabilities.width?.max ?? canvas.width;
    canvas.height = capabilities.height?.max ?? canvas.height;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new TypeError('UnknownError: an unknown error occurred');
    }

    const imageData = new ImageData(canvas.width, canvas.height);

    const populateImageData = () => {
        for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = +!props.silent * Math.floor(Math.random() * 256);
            imageData.data[i + 1] = +!props.silent * Math.floor(Math.random() * 256);
            imageData.data[i + 2] = +!props.silent * Math.floor(Math.random() * 256);
            imageData.data[i + 3] = 255;
        }
    };

    let prev: number;

    const drawFrame = (curr: number) => {
        if (prev === curr) return;

        ctx.putImageData(imageData, 0, 0);

        prev = curr;

        requestAnimationFrame(drawFrame);
    };

    populateImageData();
    requestAnimationFrame(drawFrame);
    props.eventTarget.addEventListener('toggleSilence', populateImageData);

    return canvas.captureStream(capabilities.frameRate?.max);
}

export default createVideoStream;
