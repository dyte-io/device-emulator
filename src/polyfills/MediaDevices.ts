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

    async getDisplayMedia(this: MediaDevices, constraints?: MediaStreamConstraints) {
        const originalFn = originalGetDisplayMedia.bind(this);

        if (!constraints || !this.meta) {
            const mediaStream = await originalFn(constraints);

            return mediaStream;
        }

        if (!constraints.video) {
            // NOTE(alias-rahil): getDisplayMedia always returns a videoTrack
            constraints.video = true;
        }

        const mediaStream = await evaluateConstraints(originalFn, constraints, this.meta);

        return mediaStream;
    }

    async getUserMedia(this: MediaDevices, constraints?: MediaStreamConstraints) {
        const originalFn = originalGetUserMedia.bind(this);

        if (!constraints || !this.meta) {
            const mediaStream = await originalFn(constraints);

            return mediaStream;
        }

        const mediaStream = await evaluateConstraints(originalFn, constraints, this.meta);

        return mediaStream;
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
            // TODO(ravindra-dyte): Do impact analysis of this change
            if (typeof InputDeviceInfo !== 'undefined') {
                Object.setPrototypeOf(device, InputDeviceInfo.prototype);
            }

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
            fail: false,
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

    failDevice(this: MediaDevices, emulatorDeviceId: string, fail: boolean) {
        const deviceMeta = this.meta?.[emulatorDeviceId];

        if (!deviceMeta) {
            return false;
        }

        deviceMeta.tracks.forEach((track) => {
            track.stop();
            track.dispatchEvent(new Event('ended'));
        });

        deviceMeta.fail = fail;
        deviceMeta.tracks.length = 0;
        if (this.meta) {
            this.meta[emulatorDeviceId] = deviceMeta;
        }
        return true;
    }

    removeEmulatedDevice(this: MediaDevices, emulatorDeviceId: string) {
        const deviceMeta = this.meta?.[emulatorDeviceId];

        if (!deviceMeta) {
            return false;
        }

        deviceMeta.tracks.forEach((track) => {
            track.stop();
            track.dispatchEvent(new Event('ended'));
        });

        delete this.meta![emulatorDeviceId];

        this.dispatchEvent(new Event('devicechange'));

        return true;
    }

    silenceDevice(this: MediaDevices, emulatorDeviceId: string, silent: boolean) {
        const deviceMeta = this.meta?.[emulatorDeviceId];

        if (!deviceMeta) {
            return false;
        }

        deviceMeta.silent = silent;

        deviceMeta.eventTarget.dispatchEvent(new Event('toggleSilence'));

        return true;
    }
}

/* eslint-disable @typescript-eslint/unbound-method */
MediaDevices.prototype.enumerateDevices = NewMediaDevices.prototype.enumerateDevices;
MediaDevices.prototype.getDisplayMedia = NewMediaDevices.prototype.getDisplayMedia;
MediaDevices.prototype.getUserMedia = NewMediaDevices.prototype.getUserMedia;
MediaDevices.prototype.addEmulatedDevice = NewMediaDevices.prototype.addEmulatedDevice;
MediaDevices.prototype.failDevice = NewMediaDevices.prototype.failDevice;
MediaDevices.prototype.removeEmulatedDevice = NewMediaDevices.prototype.removeEmulatedDevice;
MediaDevices.prototype.silenceDevice = NewMediaDevices.prototype.silenceDevice;
MediaDevices.prototype.emulatedAudioDeviceCapabilities = getEmulatedAudioDeviceCapabilities();
MediaDevices.prototype.emulatedVideoDeviceCapabilities = getEmulatedVideoDeviceCapabilities();
/* eslint-enable @typescript-eslint/unbound-method */
