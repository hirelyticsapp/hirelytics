import { Camera, CameraOff, Mic, MicOff, Phone, Settings } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

interface MediaControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isRecording?: boolean; // Hidden for production
  isScreenSharing?: boolean; // Hidden for production
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare?: () => void; // Hidden for production
  onStartRecording?: () => void; // Hidden for production
  onStopRecording?: () => void; // Hidden for production
  onDownloadRecording?: () => void; // Hidden for production
  onTakeSnapshot?: () => void; // Hidden for production
  onEndCall: () => void;
  onShowDeviceSelector: () => void;
  hasRecording?: boolean; // Hidden for production
}

const MediaControls: React.FC<MediaControlsProps> = ({
  isMuted,
  isCameraOff,
  isRecording: _isRecording, // Hidden for production
  isScreenSharing: _isScreenSharing, // Hidden for production
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare: _onToggleScreenShare, // Hidden for production
  onStartRecording: _onStartRecording, // Hidden for production
  onStopRecording: _onStopRecording, // Hidden for production
  onDownloadRecording: _onDownloadRecording, // Hidden for production
  onTakeSnapshot: _onTakeSnapshot, // Hidden for production
  onEndCall,
  onShowDeviceSelector,
  hasRecording: _hasRecording, // Hidden for production
}) => {
  return (
    <div className="flex items-center justify-center space-x-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border border-border">
      {/* Microphone */}
      <Button
        variant={isMuted ? 'destructive' : 'outline'}
        size="sm"
        onClick={onToggleMute}
        className="h-10 w-10 rounded-full p-0 hover:scale-105 transition-all duration-200"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
      </Button>

      {/* Camera */}
      <Button
        variant={isCameraOff ? 'destructive' : 'outline'}
        size="sm"
        onClick={onToggleCamera}
        className="h-10 w-10 rounded-full p-0 hover:scale-105 transition-all duration-200"
        title={isCameraOff ? 'Turn On Camera' : 'Turn Off Camera'}
      >
        {isCameraOff ? <CameraOff size={18} /> : <Camera size={18} />}
      </Button>

      {/* Screen Share - Hidden for production */}
      {/* <Button
        variant={isScreenSharing ? 'default' : 'outline'}
        size="sm"
        onClick={onToggleScreenShare}
        className={cn(
          'h-10 w-10 rounded-full p-0 hover:scale-105 transition-all duration-200',
          isScreenSharing && 'animate-pulse'
        )}
        title={isScreenSharing ? 'Stop Screen Share' : 'Start Screen Share'}
      >
        {isScreenSharing ? <MonitorOff size={18} /> : <Monitor size={18} />}
      </Button> */}

      {/* Combined Recording - Hidden for production */}
      {/* <Button
        variant={isRecording ? 'destructive' : 'outline'}
        size="sm"
        onClick={isRecording ? onStopRecording : onStartRecording}
        className={cn(
          'h-10 w-10 rounded-full p-0 hover:scale-105 transition-all duration-200',
          isRecording && 'animate-pulse'
        )}
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
      >
        <div
          className={cn(
            'w-3 h-3 rounded-full',
            isRecording ? 'bg-destructive-foreground animate-pulse' : 'bg-destructive'
          )}
        />
      </Button> */}

      {/* Take Snapshot - Hidden for production */}
      {/* <Button
        variant="outline"
        size="sm"
        onClick={onTakeSnapshot}
        className="h-10 w-10 rounded-full p-0 hover:scale-105 transition-all duration-200"
        title="Take Snapshot"
      >
        <ImageIcon size={18} />
      </Button> */}

      {/* Download Recording - Hidden for production */}
      {/* {hasRecording && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onDownloadRecording}
          className="h-10 w-10 rounded-full p-0 hover:scale-105 transition-all duration-200"
          title="Download Recording"
        >
          <Download size={18} />
        </Button>
      )} */}

      {/* Device Settings */}
      <Button
        variant="outline"
        size="sm"
        onClick={onShowDeviceSelector}
        className="h-10 w-10 rounded-full p-0 hover:scale-105 transition-all duration-200"
        title="Device Settings"
      >
        <Settings size={18} />
      </Button>

      {/* End Call */}
      <Button
        variant="destructive"
        size="sm"
        onClick={onEndCall}
        className="h-10 w-10 rounded-full p-0 hover:scale-105 transition-all duration-200"
        title="End Call"
      >
        <Phone size={18} className="rotate-45" />
      </Button>
    </div>
  );
};

export default MediaControls;
