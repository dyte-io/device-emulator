function createVideoStream(props: EmulatedDeviceMetaProps) {
    const canvas = document.createElement('canvas');
    const capabilities = (<InputDeviceInfo>props.device).getCapabilities();

    canvas.width = capabilities.width?.max ?? canvas.width;
    canvas.height = capabilities.height?.max ?? canvas.height;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new TypeError('UnknownError: an unknown error occurred');
    }

    setInterval(() => {
        const imageData = new ImageData(canvas.width, canvas.height);

        for (let i = 0; i < imageData.data.length; i += 4) {
            if (!props.silent) {
                imageData.data[i] = Math.floor(Math.random() * 256);
                imageData.data[i + 1] = Math.floor(Math.random() * 256);
                imageData.data[i + 2] = Math.floor(Math.random() * 256);
            }

            imageData.data[i + 3] = 256;
        }

        ctx.putImageData(imageData, 0, 0);
    });

    return canvas.captureStream(capabilities.frameRate?.max);
}

export default createVideoStream;
