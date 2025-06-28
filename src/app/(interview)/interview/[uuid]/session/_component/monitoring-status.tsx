import { Camera, Monitor, Video } from 'lucide-react';
import React from 'react';

import { Card } from '@/components/ui/card';

interface MonitoringStatusProps {
  sessionInstruction?: {
    screenMonitoring: boolean;
    screenMonitoringMode: 'photo' | 'video';
    screenMonitoringInterval?: 30 | 60;
    cameraMonitoring: boolean;
    cameraMonitoringMode: 'photo' | 'video';
    cameraMonitoringInterval?: 30 | 60;
    duration: number;
  };
}

const MonitoringStatus: React.FC<MonitoringStatusProps> = ({ sessionInstruction }) => {
  if (
    !sessionInstruction ||
    (!sessionInstruction.screenMonitoring && !sessionInstruction.cameraMonitoring)
  ) {
    return null;
  }

  return (
    <Card className="p-3 mb-4 bg-yellow-50 border-yellow-200">
      <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
        <Camera className="w-4 h-4 mr-2" />
        Active Monitoring Features
      </h3>
      <div className="space-y-2 text-xs text-yellow-700">
        {sessionInstruction.screenMonitoring && (
          <div className="flex items-center space-x-2">
            <Monitor className="w-3 h-3" />
            <span>
              Screen monitoring: {sessionInstruction.screenMonitoringMode}
              {sessionInstruction.screenMonitoringMode === 'photo' &&
                sessionInstruction.screenMonitoringInterval &&
                ` (every ${sessionInstruction.screenMonitoringInterval}s)`}
            </span>
          </div>
        )}
        {sessionInstruction.cameraMonitoring && (
          <div className="flex items-center space-x-2">
            <Video className="w-3 h-3" />
            <span>
              Camera monitoring: {sessionInstruction.cameraMonitoringMode}
              {sessionInstruction.cameraMonitoringMode === 'photo' &&
                sessionInstruction.cameraMonitoringInterval &&
                ` (every ${sessionInstruction.cameraMonitoringInterval}s)`}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MonitoringStatus;
