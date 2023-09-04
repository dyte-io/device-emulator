import { useEffect, useRef, useState } from "react";

export const PreviewAudioInput = ({device}: {device: MediaDeviceInfo}) => {
    const [error, setError] = useState<Error | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const doPreview = async () => {
            navigator.mediaDevices.getUserMedia({
                audio: { deviceId: { exact: device.deviceId } }
            })
            .then((stream) => {
                if (audioRef.current) {
                    audioRef.current.srcObject = stream;
                }
            })
            .catch((e) => {
                setError(e);
            });
        };

        doPreview();
    }, [device]);

    return (
        <div className="flex flex-col">
            {error && <div className="text-red-500">{error.message}</div>}
            {!error && <audio autoPlay playsInline controls ref={audioRef} />}
        </div>
    );
};

export const PreviewVideoInput = ({device}: {device: MediaDeviceInfo}) => {
    const [error, setError] = useState<Error | null>(null);
    const [track, setTrack] = useState<MediaStreamTrack | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const getTracks = async () => {
        if (track) {
            track.stop();
            setError(null);
        }
        navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: device.deviceId } }
        }).then((stream) => {
            stream.addEventListener('removetrack', () => {
                videoRef.current!.srcObject = null;
                console.log('track-removed');
            });
            setTrack(stream.getVideoTracks()[0]);
            setError(null);
        }).catch((e) => {
            setError(e);
        });
    };

    useEffect(() => {
        if (!track) return;
        if (!videoRef.current) return;
        track.addEventListener('ended', () => {
            setError(null);
            getTracks();
        });

        videoRef.current.srcObject = new MediaStream([track]);
    }, [track]);

    useEffect(() => {
        getTracks();
    }, []);

    return (
        <div className="flex flex-col">
            <div className="flex flex-row gap-2">
                <button
                    className="rounded-md px-3 py-2 text-sm font-semibold shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={async () => {
                        if (!videoRef.current) return;
                        await getTracks();
                    }}
                >
                    🔃 Refetch Track
                </button>
                <button
                    className="rounded-md px-3 py-2 text-sm font-semibold shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={async () => {
                        if (!videoRef.current) return;
                        track?.stop();
                    }}
                >
                    ❌ Stop Track
                </button>
            </div>

            {error && <div className="text-red-500">{error.message}</div>}
            {!error && <video
                ref={videoRef}
                className="h-full w-full object-cover"
                autoPlay
                playsInline
                controls
            />}
        </div>
    );
};

export const PreviewAudioOutput = ({device}: {device: MediaDeviceInfo}) => {

    return (
        <div className="flex flex-col">
            {device.kind} PREVIEW COMING SOON
        </div>
    );
};
