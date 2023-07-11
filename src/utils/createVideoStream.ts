import * as WorkerTimers from 'worker-timers';

function createVideoStream(props: EmulatedDeviceMetaProps) {
    const canvas = document.createElement('canvas');
    const canvasFramePaintStartTime = new Date().getTime();
    const capabilities = (<InputDeviceInfo>props.device).getCapabilities();

    canvas.width = capabilities.width?.max ?? 640;
    canvas.height = capabilities.height?.max ?? 480;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new TypeError('UnknownError: an unknown error occurred');
    }

    const drawFrame = () => {
        if (!props.silent) {
            ctx.fillStyle = 'green';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = '50px Arial';
            ctx.fillStyle = 'blue';
            ctx.textAlign = 'center';
            let secondsLapsed = new Date().getTime() - canvasFramePaintStartTime;
            /**
             * NOTE(ravindra-dyte):
             * We need 10 frames per second to avoid major canvas redrawings.
             * Because latency would be near impossible to go below 100 ms, there is no point of drawing more than 10 fps.
             * Diving ms by 100 to get how many 100ms redraws are over
             */
            secondsLapsed /= 100;
            /**
             * NOTE(ravindra-dyte):
             * Tessaract js can't detect numbers lower than 100 with accuracy.
             * Adding the padding of 1000 to give it a break
             */
            secondsLapsed = Math.floor(secondsLapsed + 1000);
            ctx.fillText(secondsLapsed.toString(), canvas.width / 2, canvas.height / 2);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    WorkerTimers.setInterval(drawFrame, 100);

    return canvas.captureStream(capabilities.frameRate?.max);
}

export default createVideoStream;
