import {
  PreviewAudioInput,
  PreviewAudioOutput,
  PreviewVideoInput
} from "./Previewer";
import DeviceActions from "./DeviceActions";

interface Props {
  device: MediaDeviceInfo;
  meta: EmulatedDeviceMetaProps | null;
  onFailToggle: () => void;
  onSilenceToggle: () => void;
  onDelete: () => void;
}

export default function DevicePreview({
  device,
  meta,
  onFailToggle,
  onSilenceToggle,
  onDelete
}: Props) {
  let preview = null;
  // call 3 methods based on kind of device
  if (device.kind === "audioinput") {
    preview = <PreviewAudioInput device={device} />;
  }
  if (device.kind === "audiooutput") {
    preview = <PreviewAudioOutput device={device} />;
  }
  if (device.kind === "videoinput") {
    preview = <PreviewVideoInput device={device} />;
  }

  if (!preview) return null;

  return (
    <div className="flex flex-col gap-2">
      <DeviceActions
        device={device}
        meta={meta}
        onFailToggle={onFailToggle}
        onSilenceToggle={onSilenceToggle}
        onDelete={onDelete}
      />
      {preview}
    </div>
  );
}
