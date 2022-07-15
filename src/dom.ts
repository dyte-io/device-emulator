declare global {
    type EmulatedDeviceCapabilitiesInput = Omit<
        MediaTrackCapabilities & MediaTrackConstraints,
        'deviceId' | 'groupId'
    >;

    interface EmulatedDeviceMeta {
        emulatedDevices: (MediaDeviceInfo | InputDeviceInfo)[];

        meta: {
            [deviceId: string]: {
                tracks: MediaStreamTrack[];
            };
        };
    }

    interface HTMLAudioElement {
        setSinkId(sinkId: string): Promise<void>;
    }

    interface MediaDevices {
        meta?: EmulatedDeviceMeta;

        getDisplayMedia(
            constraints?: DisplayMediaStreamConstraints | EmulatedMediaStreamConstraints,
        ): Promise<MediaStream>;

        getUserMedia(
            constraints?: MediaStreamConstraints | EmulatedMediaStreamConstraints,
        ): Promise<MediaStream>;

        addEmulatedDevice(kind: 'audiooutput'): string;
        addEmulatedDevice(
            kind: Exclude<MediaDeviceKind, 'audiooutput'>,
            capabilities?: EmulatedDeviceCapabilitiesInput,
        ): string;

        removeEmulatedDevice(emulatorDeviceId: string): boolean;
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
