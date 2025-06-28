import { CameraOff } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

interface UserVideoFeedProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOff: boolean;
  isUserSpeaking: boolean;
}

const UserVideoFeed: React.FC<UserVideoFeedProps> = ({ videoRef, isCameraOff, isUserSpeaking }) => {
  return (
    <div
      className={cn(
        'relative w-full h-full bg-muted rounded-lg overflow-hidden border border-border',
        isUserSpeaking && 'ring-4 ring-primary ring-opacity-75 animate-pulse'
      )}
    >
      {!isCameraOff ? (
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <div className="text-center">
            <CameraOff size={48} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Camera is off</p>
          </div>
        </div>
      )}

      {/* User label */}
      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-2 py-1 rounded border border-border">
        <span className="text-foreground text-sm font-medium">You</span>
      </div>
    </div>
  );
};

export default UserVideoFeed;
