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
        fail: boolean;
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
        silenceDevice(emulatorDeviceId: string, silent: boolean): boolean;
        failDevice(emulatorDeviceId: string, fail: boolean): boolean;
        addEmulatedDevice(kind: 'audiooutput'): string;
        addEmulatedDevice(kind: 'audioinput', capabilities?: EmulatedAudioDeviceCapabilities): string;
        addEmulatedDevice(kind: 'videoinput', capabilities?: EmulatedVideoDeviceCapabilities): string;
    }
    interface InputDeviceInfo {
        getCapabilities(): MediaTrackCapabilities;
    }
    interface HTMLMediaElement {
        sinkId: string;
        setSinkId(sinkId: string): Promise<void>;
    }
    interface LegacyMediaTrackConstraints {
        sourceId?: string;
    }
    interface MediaTrackConstraints {
        optional?: LegacyMediaTrackConstraints | LegacyMediaTrackConstraints[];
        mandatory?: LegacyMediaTrackConstraints | LegacyMediaTrackConstraints[];
    }
}
export {};
