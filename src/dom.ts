declare global {
    type EmulatedAudioDeviceCapabilities = Record<string, never>;

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

    type EmulatedDeviceMeta = Record<string, EmulatedDeviceMetaProps | undefined>;

    interface MediaDevices {
        meta?: EmulatedDeviceMeta;
        emulatedAudioDeviceCapabilities: MediaTrackCapabilities;
        emulatedVideoDeviceCapabilities: MediaTrackCapabilities;
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

    interface LegacyMediaTrackConstraints {
        sourceId?: string;
    }

    interface MediaTrackConstraints {
        optional?: LegacyMediaTrackConstraints | LegacyMediaTrackConstraints[]; //
        mandatory?: LegacyMediaTrackConstraints | LegacyMediaTrackConstraints[]; //
    }
}

MediaStreamTrack.prototype.getCapabilities =
    // eslint-disable-next-line @typescript-eslint/unbound-method
    MediaStreamTrack.prototype.getCapabilities ||
    function getCapabilitiesPlaceholder() {
        return {};
    };

export {};
