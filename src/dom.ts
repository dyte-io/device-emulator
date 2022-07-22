declare global {
    interface EmulatedAudioDeviceCapabilities {
        [_: string]: never;
    }

    interface EmulatedVideoDeviceCapabilities {
        height?: {
            max?: number;
        };
        width?: {
            max?: number;
        };
        frameRate?: {
            max?: number;
        };
        facingMode?: string[];
    }

    interface EmulatedDeviceMetaProps {
        tracks: MediaStreamTrack[];
        bricked: boolean;
        silent: boolean;
        device: MediaDeviceInfo;
        eventTarget: EventTarget;
    }

    interface EmulatedDeviceMeta {
        [deviceId: string]: undefined | EmulatedDeviceMetaProps;
    }

    interface MediaDevices {
        meta?: EmulatedDeviceMeta;
        audioCapabilities: MediaTrackCapabilities;
        videoCapabilities: MediaTrackCapabilities;
        removeEmulatedDevice(emulatorDeviceId: string): boolean;
        silenceDevice(emulatorDeviceId: string): boolean;
        unsilenceDevice(emulatorDeviceId: string): boolean;
        brickDevice(emulatorDeviceId: string): boolean;
        unbrickDevice(emulatorDeviceId: string): boolean;

        addEmulatedDevice(kind: 'audiooutput'): string;
        addEmulatedDevice(
            kind: 'audioinput',
            capabilities?: EmulatedAudioDeviceCapabilities,
        ): string;
        addEmulatedDevice(
            kind: 'videoinput',
            capabilities?: EmulatedVideoDeviceCapabilities,
        ): string;
    }

    interface InputDeviceInfo {
        getCapabilities(): MediaTrackCapabilities; //
    }

    interface HTMLMediaElement {
        sinkId: string; //
        setSinkId(sinkId: string): Promise<void>; //
    }
}

export {};
