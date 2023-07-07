import './dom';
import './polyfills/HTMLAudioElement';
import './polyfills/MediaDevices';

// Dispatch event to inform other scripts that the emulator is fully loaded
window.dispatchEvent(new Event('dyte.deviceEmulatorLoaded'));
