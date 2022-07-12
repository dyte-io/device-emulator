declare global {
    // TODO(alias-rahil): remove later after it's added in `lib.dom.d.ts`.
    interface HTMLMediaElement {
        setSinkId(sinkId: string): Promise<void>;
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
            capabilities: Omit<MediaTrackCapabilities, 'deviceId' | 'groupId'>,
        ): string;
        addEmulatedDevice(kind: 'audiooutput'): string;
        removeEmulatedDevice(emulatorDeviceId: string): undefined | MediaDeviceInfo;
        silenceTrack(emulatorDeviceId: string): void;
        brickDevice(emulatorDeviceId: string): void;
        emulatedDevices?: MediaDeviceInfo[];
    }

    // TODO(alias-rahil): remove later after it's added in `lib.dom.d.ts`.
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
