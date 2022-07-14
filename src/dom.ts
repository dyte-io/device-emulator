declare global {
    interface HTMLMediaElement {
        setSinkId(sinkId: string): Promise<void>;
    }

    interface MediaDevices {
        emulatedDevices?: (MediaDeviceInfo | InputDeviceInfo)[];

        getDisplayMedia(
            constraints?: DisplayMediaStreamConstraints | EmulatedMediaStreamConstraints,
        ): Promise<MediaStream>;

        getUserMedia(
            constraints?: MediaStreamConstraints | EmulatedMediaStreamConstraints,
        ): Promise<MediaStream>;

        addEmulatedDevice(kind: 'audiooutput'): string;
        addEmulatedDevice(
            kind: Exclude<MediaDeviceKind, 'audiooutput'>,
            capabilities?: Omit<
                MediaTrackCapabilities & MediaTrackConstraints,
                'deviceId' | 'groupId'
            >,
        ): string;

        removeEmulatedDevice(
            emulatorDeviceId: string,
        ): undefined | MediaDeviceInfo | InputDeviceInfo;

        silenceTrack(emulatorDeviceId: string): void;
        brickDevice(emulatorDeviceId: string): void;
        enumerateDevices(): Promise<(MediaDeviceInfo | InputDeviceInfo)[]>;
    }

    interface InputDeviceInfo {
        getCapabilities(): MediaTrackCapabilities & MediaTrackConstraints;
    }

    interface EmulatedMediaStreamConstraints {
        audio?: {
            deviceId: { exact: string };
        };

        video?: {
            deviceId: { exact: string };
        };

        emulated: true;
    }
}

export {};
