import deepmerge from 'deepmerge';
import evaluateConstraints from '../utils/evaluateConstraints';
import getEmulatedAudioDeviceCapabilities from '../utils/getEmulatedAudioDeviceCapabilities';
import getEmulatedVideoDeviceCapabilities from '../utils/getEmulatedVideoDeviceCapabilities';

/* eslint-disable @typescript-eslint/unbound-method */
const originalEnumerateDevices = MediaDevices.prototype.enumerateDevices;
const originalGetDisplayMedia = MediaDevices.prototype.getDisplayMedia;
const originalGetUserMedia = MediaDevices.prototype.getUserMedia;
/* eslint-enable @typescript-eslint/unbound-method */

class NewMediaDevices {
    async enumerateDevices(this: MediaDevices) {
        const realDevices = await originalEnumerateDevices.call(this);

        if (!this.meta) {
            return realDevices;
        }

        const deviceIds = Object.keys(this.meta);
        const emulatedDevices = deviceIds.map((deviceId) => this.meta![deviceId]!.device);

        return emulatedDevices.concat(realDevices);
    }

    async getDisplayMedia(this: MediaDevices, constraints?: DisplayMediaStreamConstraints) {
        const originalFn = originalGetDisplayMedia.bind(this);

        if (!constraints || !this.meta) {
            return originalFn(constraints);
        }

        if (!constraints.video) {
            // NOTE(alias-rahil): getDisplayMedia always returns a videoTrack
            constraints.video = true;
        }

        return evaluateConstraints(originalFn, constraints, this.meta);
    }

    async getUserMedia(this: MediaDevices, constraints?: MediaStreamConstraints) {
        const originalFn = originalGetUserMedia.bind(this);

        if (!constraints || !this.meta) {
            return originalFn(constraints);
        }

        return evaluateConstraints(originalFn, constraints, this.meta);
    }

    addEmulatedDevice(
        this: MediaDevices,
        kind: MediaDeviceKind,
        capabilities?: EmulatedAudioDeviceCapabilities | EmulatedVideoDeviceCapabilities,
    ) {
        const deviceId = crypto.randomUUID();
        const label = `Emulated device of ${kind} kind - ${deviceId}`;
        const groupId = 'emulated-device-group';
        const device = { deviceId, kind, label, groupId, toJSON: () => device };

        if (kind === 'audioinput' || kind === 'videoinput') {
            Object.setPrototypeOf(device, InputDeviceInfo.prototype);

            const defaultCapabilities =
                kind === 'audioinput'
                    ? this.emulatedAudioDeviceCapabilities
                    : this.emulatedVideoDeviceCapabilities;

            const totalCapabilities = capabilities
                ? deepmerge(defaultCapabilities, capabilities)
                : defaultCapabilities;

            (<InputDeviceInfo>device).getCapabilities = () => ({
                ...totalCapabilities,
                deviceId: device.deviceId,
                groupId: device.groupId,
            });
        } else {
            Object.setPrototypeOf(device, MediaDeviceInfo.prototype);
        }

        const meta = {
            tracks: [],
            bricked: false,
            silent: false,
            device,
            eventTarget: new EventTarget(),
        };

        if (!this.meta) {
            this.meta = { [device.deviceId]: meta };
        } else {
            this.meta[device.deviceId] = meta;
        }

        this.dispatchEvent(new Event('devicechange'));

        return deviceId;
    }

    brickDevice(this: MediaDevices, emulatorDeviceId: string) {
        const deviceMeta = this.meta?.[emulatorDeviceId];

        if (!deviceMeta) {
            return false;
        }

        deviceMeta.tracks.forEach((track) => {
            track.stop();
        });

        deviceMeta.bricked = true;
        deviceMeta.tracks.length = 0;

        return true;
    }

    removeEmulatedDevice(this: MediaDevices, emulatorDeviceId: string) {
        const deviceMeta = this.meta?.[emulatorDeviceId];

        if (!deviceMeta) {
            return false;
        }

        deviceMeta.tracks.forEach((track) => {
            track.stop();
        });

        delete this.meta![emulatorDeviceId];

        this.dispatchEvent(new Event('devicechange'));

        return true;
    }

    silenceDevice(this: MediaDevices, emulatorDeviceId: string) {
        const deviceMeta = this.meta?.[emulatorDeviceId];

        if (!deviceMeta) {
            return false;
        }

        deviceMeta.silent = true;

        deviceMeta.eventTarget.dispatchEvent(new Event('toggleSilence'));

        return true;
    }

    unbrickDevice(this: MediaDevices, emulatorDeviceId: string) {
        const deviceMeta = this.meta?.[emulatorDeviceId];

        if (!deviceMeta) {
            return false;
        }

        deviceMeta.bricked = false;

        return true;
    }

    unsilenceDevice(this: MediaDevices, emulatorDeviceId: string) {
        const deviceMeta = this.meta?.[emulatorDeviceId];

        if (!deviceMeta) {
            return false;
        }

        deviceMeta.silent = false;

        deviceMeta.eventTarget.dispatchEvent(new Event('toggleSilence'));

        return true;
    }
}

/* eslint-disable @typescript-eslint/unbound-method */
MediaDevices.prototype.enumerateDevices = NewMediaDevices.prototype.enumerateDevices;
MediaDevices.prototype.getDisplayMedia = NewMediaDevices.prototype.getDisplayMedia;
MediaDevices.prototype.getUserMedia = NewMediaDevices.prototype.getUserMedia;
MediaDevices.prototype.addEmulatedDevice = NewMediaDevices.prototype.addEmulatedDevice;
MediaDevices.prototype.brickDevice = NewMediaDevices.prototype.brickDevice;
MediaDevices.prototype.removeEmulatedDevice = NewMediaDevices.prototype.removeEmulatedDevice;
MediaDevices.prototype.silenceDevice = NewMediaDevices.prototype.silenceDevice;
MediaDevices.prototype.unbrickDevice = NewMediaDevices.prototype.unbrickDevice;
MediaDevices.prototype.unsilenceDevice = NewMediaDevices.prototype.unsilenceDevice;
MediaDevices.prototype.emulatedAudioDeviceCapabilities = getEmulatedAudioDeviceCapabilities();
MediaDevices.prototype.emulatedVideoDeviceCapabilities = getEmulatedVideoDeviceCapabilities();
/* eslint-enable @typescript-eslint/unbound-method */
