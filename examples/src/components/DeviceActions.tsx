import deviceEmulatorHelper from "../helper";

const COMMON_STYLE = "rounded-md px-3 py-2 text-sm font-semibold shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

const DELETE_BUTTON_STYLE = "bg-red-600 text-white";
const MUTE_BUTTON_STYLE = "bg-green-600 text-white";
const STOP_BUTTON_STYLE = "bg-orange-600 text-white";
interface Props {
    device: MediaDeviceInfo;
    meta: EmulatedDeviceMetaProps | null;
    onFailToggle: () => void;
    onSilenceToggle: () => void;
    onDelete: () => void;
}

export default function DeviceActions({device, meta, onFailToggle, onDelete, onSilenceToggle}: Props) {
    const isVirtualDevice = deviceEmulatorHelper.isVirtualDevice(device);

    if (!meta) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <div className="flex flex-row gap-2">
                <button
                    disabled={!isVirtualDevice}
                    className={`${COMMON_STYLE} ${isVirtualDevice ? DELETE_BUTTON_STYLE: ''}`}
                    data-id={device.deviceId}
                    onClick={onDelete}
                >
                    Delete
                </button>
                <button
                    disabled={!isVirtualDevice}
                    className={`${COMMON_STYLE} ${isVirtualDevice ? STOP_BUTTON_STYLE: ''}`}
                    data-id={device.deviceId}
                    onClick={onFailToggle}
                >
                    {meta.fail ? "Undo Fail" : "Force Fail"}
                </button>
                <button
                    disabled={!isVirtualDevice}
                    className={`${COMMON_STYLE} ${isVirtualDevice ? MUTE_BUTTON_STYLE: ''}`}
                    data-id={device.deviceId}
                    onClick={onSilenceToggle}
                >
                    {meta.silent ? "Unmute" : "Mute"}
                </button>
            </div>
        </div>
    )
}