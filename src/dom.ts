declare global {
    interface HTMLMediaElement {
        setSinkId(sinkId: string): Promise<void>; // TODO(alias-rahil): remove later after it's added in `lib.dom.d.ts`.
        captureStream(): MediaStream; // TODO(alias-rahil): remove later after it's added in `lib.dom.d.ts`.
    }

    interface MediaDevices {
        getDisplayMedia(
            constraints?: DisplayMediaStreamConstraints | EmulatedMediaStreamConstraints,
        ): Promise<MediaStream>;
        getUserMedia(
            constraints?: MediaStreamConstraints | EmulatedMediaStreamConstraints,
        ): Promise<MediaStream>;
        addEmulatedDevice(
            kind: Exclude<MediaDeviceKind, 'audiooutput'>,
            capabilities: Omit<
                MediaTrackCapabilities & MediaTrackConstraints,
                'deviceId' | 'groupId'
            >,
        ): string;
        addEmulatedDevice(kind: 'audiooutput'): string;
        removeEmulatedDevice(emulatorDeviceId: string): undefined | MediaDeviceInfo;
        silenceTrack(emulatorDeviceId: string): void;
        brickDevice(emulatorDeviceId: string): void;
        emulatedDevices?: MediaDeviceInfo[];
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
