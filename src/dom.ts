declare global {
    type EmulatedDeviceCapabilitiesInput = Omit<
        MediaTrackCapabilities & MediaTrackConstraints,
        'deviceId' | 'groupId'
    >;

    interface EmulatedDeviceMetaProps {
        tracks: MediaStreamTrack[];
        bricked: boolean;
        silent: boolean;
    }

    interface EmulatedDeviceMeta {
        emulatedDevices: MediaDeviceInfo[];

        meta: {
            [deviceId: string]: EmulatedDeviceMetaProps;
        };
    }

    interface HTMLAudioElement {
        sinkId: string;

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
        silenceDevice(emulatorDeviceId: string): void;
        brickDevice(emulatorDeviceId: string): void;
    }

    interface InputDeviceInfo {
        getCapabilities(): MediaTrackCapabilities;
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
