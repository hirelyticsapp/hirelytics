import {
  Camera,
  CameraOff,
  Download,
  ImageIcon,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Phone,
  Settings,
} from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MediaControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isRecording: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDownloadRecording: () => void;
  onTakeSnapshot: () => void;
  onEndCall: () => void;
  onShowDeviceSelector: () => void;
  hasRecording: boolean;
}

const MediaControls: React.FC<MediaControlsProps> = ({
  isMuted,
  isCameraOff,
  isRecording,
  isScreenSharing,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onStartRecording,
  onStopRecording,
  onDownloadRecording,
  onTakeSnapshot,
  onEndCall,
  onShowDeviceSelector,
  hasRecording,
}) => {
  return (
    <div className="flex items-center justify-center space-x-2 bg-black/80 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
      {/* Microphone */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleMute}
        className={cn(
          'h-10 w-10 rounded-full p-0 hover:scale-105 transition-all duration-200',
          isMuted
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        )}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
      </Button>

      {/* Camera */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleCamera}
        className={cn(
          'h-10 w-10 rounded-full p-0 hover:scale-105 transition-all duration-200',
          isCameraOff
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        )}
        title={isCameraOff ? 'Turn On Camera' : 'Turn Off Camera'}
      >
        {isCameraOff ? <CameraOff size={18} /> : <Camera size={18} />}
      </Button>

      {/* Screen Share */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleScreenShare}
        className={cn(
          'h-10 w-10 rounded-full p-0 hover:scale-105 transition-all duration-200',
          isScreenSharing
            ? 'bg-blue-500 hover:bg-blue-600 text-white animate-pulse'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        )}
        title={isScreenSharing ? 'Stop Screen Share' : 'Start Screen Share'}
      >
        {isScreenSharing ? <MonitorOff size={18} /> : <Monitor size={18} />}
      </Button>

      {/* Combined Recording */}
      <Button
        variant="ghost"
        size="sm"
        onClick={isRecording ? onStopRecording : onStartRecording}
        className={cn(
          'h-10 w-10 rounded-full p-0 hover:scale-105 transition-all duration-200',
          isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        )}
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
      >
        <div
          className={cn(
            'w-3 h-3 rounded-full',
            isRecording ? 'bg-white animate-pulse' : 'bg-red-400'
          )}
        />
      </Button>

      {/* Take Snapshot */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onTakeSnapshot}
        className="h-10 w-10 rounded-full p-0 bg-gray-700 hover:bg-gray-600 text-white hover:scale-105 transition-all duration-200"
        title="Take Snapshot"
      >
        <ImageIcon size={18} />
      </Button>

      {/* Download Recording */}
      {hasRecording && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDownloadRecording}
          className="h-10 w-10 rounded-full p-0 bg-green-500 hover:bg-green-600 text-white hover:scale-105 transition-all duration-200"
          title="Download Recording"
        >
          <Download size={18} />
        </Button>
      )}

      {/* Device Settings */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onShowDeviceSelector}
        className="h-10 w-10 rounded-full p-0 bg-gray-700 hover:bg-gray-600 text-white hover:scale-105 transition-all duration-200"
        title="Device Settings"
      >
        <Settings size={18} />
      </Button>

      {/* End Call */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onEndCall}
        className="h-10 w-10 rounded-full p-0 bg-red-500 hover:bg-red-600 text-white hover:scale-105 transition-all duration-200"
        title="End Call"
      >
        <Phone size={18} className="rotate-45" />
      </Button>
    </div>
  );
};

export default MediaControls;
