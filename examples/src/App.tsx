import { useEffect, useState } from 'react';
import './App.css'
import deviceEmulatorHelper from './helper';
import DeviceList from './components/DeviceList';
import DevicePreview from './components/DevicePreview';

function App() {
  const [deviceListenerAdded, setDeviceListenerAdded] = useState(false);
  const [deviceType, setDeviceType] = useState<'audioinput' | 'audiooutput' | 'videoinput'>("audioinput");
  const [currentDevice, setCurrentDevice] = useState<MediaDeviceInfo | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [meta, setMeta] = useState<EmulatedDeviceMetaProps | null>(null);

  useEffect(() => {
    if(deviceListenerAdded){
      return;
    }
    navigator.mediaDevices.addEventListener("devicechange", () => {
      updateDevices();
    });
    setDeviceListenerAdded(true);
  }, [deviceListenerAdded]);

  const updateMeta = () => {
    if (!currentDevice || !deviceEmulatorHelper.isVirtualDevice(currentDevice)){
      setMeta(null);
      return;
    };
    const newMeta = deviceEmulatorHelper.getDeviceMeta(currentDevice.deviceId);
    if(newMeta){
      setMeta({...newMeta});
    } else {
      setMeta(null);
    }
  };

  useEffect(() => {
    updateMeta();
  }, [currentDevice]);



  const updateDevices = async () => {
    let devices = await navigator.mediaDevices.enumerateDevices();
    devices = devices?.filter(device => device.label?.includes('Emulated device of'));
    setDevices(devices);
  };

  const addDevice = async () => {
    const newDeviceId = deviceEmulatorHelper.addDevice(deviceType);
    if(!currentDevice){
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const newDevice = allDevices.find((d) => d.deviceId === newDeviceId);
      if (newDevice) {
        setCurrentDevice(newDevice);
      }
    }
  };

  const deleteDevice = async () => {
    if (!currentDevice) return;
    deviceEmulatorHelper.removeDevice(currentDevice.deviceId);
    setCurrentDevice(null);
  };

  const toggleSilence = () => {
    if (!currentDevice) return;
    deviceEmulatorHelper.toggleSilence(currentDevice.deviceId);
    updateMeta();
  };

  const toggleFailDevice = () => {
    if (!currentDevice) return;
    deviceEmulatorHelper.toggleFailDevice(currentDevice.deviceId);
    updateMeta();
  };


  const updateCurrentDevice = (deviceId: string) => {
    const current = devices.find((d) => d.deviceId === deviceId);
    if (current) {
      setCurrentDevice(current);
    }
  };
  

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
              {(devices?.length && !currentDevice) ? (
                <div className="flex flex-col">
                  <h3 className="pl-3">
                    Please select a device from the device list to preview.
                  </h3>
                </div>
              ): ''}
            </div>
          </div>

      </main>
    </div>
  );
}

export default App
