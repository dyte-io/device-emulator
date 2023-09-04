
interface Props {
    devices: MediaDeviceInfo[];
    currentDevice: MediaDeviceInfo | null;
    previewDevice: (deviceId: string) => void;
}

const ACTIVE_BUTTON_CLASS = "w-full text-left px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500";
const NORMAL_BUTTON_CLASS = "w-full text-left px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300";

export default function DeviceList(
    { devices, previewDevice, currentDevice}: Props
) {
    if(!devices?.length){
        return (<div className="flex flex-col">
            <h3 className="pl-3 font-bold">No virtual devices to show. Please add a virtual device first.</h3>
        </div>);
    }

    return (
        <div className="flex flex-col">
            <h3 className="pl-3 font-bold">Select a device</h3>
            <ul>
                {devices.map((device) => {
                    const isCurrentDevice = currentDevice && device.deviceId === currentDevice?.deviceId && device.kind === currentDevice?.kind;
                    return (
                        <li key={device.kind + device.deviceId} className="p-1 border shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                            <button
                                className={isCurrentDevice ? ACTIVE_BUTTON_CLASS : NORMAL_BUTTON_CLASS}
                                data-id={device.deviceId}
                                onClick={() => previewDevice(device.deviceId)}
                            >
                                {device.label}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}