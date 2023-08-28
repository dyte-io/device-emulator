import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css'
import deviceEmulatorHelper from './helper';
import DeviceList from './components/DeviceList';
import DevicePreview from './components/DevicePreview';

function App() {
  const requested = useRef(false);
  const [deviceType, setDeviceType] = useState<'audioinput' | 'audiooutput' | 'videoinput'>("audioinput");
  const [currentDevice, setCurrentDevice] = useState<MediaDeviceInfo | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [meta, setMeta] = useState<EmulatedDeviceMetaProps | undefined>(undefined);

  useEffect(() => {
    requested.current = true;
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      if (requested.current) {
        setDevices(devices);
      }
    });

    navigator.mediaDevices.addEventListener("devicechange", () => {
      updateDevices();
    });

    return () => {
      requested.current = false;
    };
  }, []);

  useEffect(() => {
    updateMeta();
  }, [currentDevice]);

  const updateMeta = useCallback(() => {
    if (!currentDevice || !deviceEmulatorHelper.isVirtualDevice(currentDevice)) return;
    const m = deviceEmulatorHelper.getDeviceMeta(currentDevice.deviceId);
    console.log('meta', m);
    setMeta(m);
  },[currentDevice]);

  const updateDevices = useCallback(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    setDevices(devices);
  },[]);

  const addDevice = useCallback(async () => {
    const newDeviceId = deviceEmulatorHelper.addDevice(deviceType);
    await updateDevices();
    const current = devices.find((d) => d.deviceId === newDeviceId);
    if (current) {
      setCurrentDevice(current);
    }
  },[deviceType, devices, updateDevices]);

  const deleteDevice = useCallback(async () => {
    if (!currentDevice) return;
    deviceEmulatorHelper.removeDevice(currentDevice.deviceId);
    updateMeta();
  },[currentDevice, updateMeta]);

  const toggleSilence = useCallback(() => {
    if (!currentDevice) return;
    deviceEmulatorHelper.toggleSilence(currentDevice.deviceId);
    updateMeta();
  },[currentDevice, updateMeta]);

  const toggleFailDevice = useCallback(() => {
    if (!currentDevice) return;
    deviceEmulatorHelper.toggleFailDevice(currentDevice.deviceId);
    updateMeta();
  },[currentDevice, updateMeta]);


  const updateCurrentDevice = useCallback((deviceId: string) => {
    const current = devices.find((d) => d.deviceId === deviceId);
    console.log(current);
    if (current) {
      setCurrentDevice(current);
    }
  },[devices]);
  

  return (
    <div className="min-h-full w-full space-y-12 content-auto">
      <main>
        <a href="https://dyte.io">
          <img src="https://assets.dyte.io/logo-outlined.png" alt="Logo" width="120" />
        </a>
        <h1 className="text-4xl font-bold text-center">Device Emulator Demo</h1>
        <div className="border-b border-gray-900/10 p-5 flex gap-5 items-center justify-center">
            <div className="bg-gray-200 border border-gray-200 text-gray-700 flex shadow-sm rounded-md overflow-hidden">
              <select
                className="selector"
                id="device-type"
                onChange={(e) => setDeviceType(e.target.value as "audioinput" | "audiooutput" | "videoinput")}
              >
                <option value="audioinput">Audio input</option>
                <option value="audiooutput">Audio output</option>
                <option value="videoinput">Video input</option>
              </select>
              <button
                className="bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={addDevice}
              >
                Add virtual device
              </button>
            </div>
          </div>
          <div
            className="grid grid-cols-2 gap-4 mt-5 p-10"
            style={{gridTemplateRows: "auto 1fr"}}
          >
            <div className="flex">
              <DeviceList
                devices={devices}
                currentDevice={currentDevice || null}
                previewDevice={(deviceId) => updateCurrentDevice(deviceId)}
              />
            </div>
            <div className="flex" id="preview-screen">
              {currentDevice && (
                <DevicePreview
                  device={currentDevice}
                  meta={meta}
                  onSilenceToggle={toggleSilence}
                  onFailToggle={toggleFailDevice}
                  onDelete={deleteDevice} 
                />
              )}
            </div>
          </div>

      </main>
    </div>
  );
}

export default App
