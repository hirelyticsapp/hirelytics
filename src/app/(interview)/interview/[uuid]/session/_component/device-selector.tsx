import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DeviceSelectorProps {
  onClose: () => void;
  onDeviceChange: (deviceId: string, kind: string) => void;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({ onClose, onDeviceChange }) => {
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioInputs(devices.filter((device) => device.kind === 'audioinput'));
        setVideoInputs(devices.filter((device) => device.kind === 'videoinput'));
        setAudioOutputs(devices.filter((device) => device.kind === 'audiooutput'));
      } catch (error) {
        console.error('Error enumerating devices:', error);
      }
    };

    getDevices();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">Device Settings</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Microphone */}
          <div>
            <label className="block text-sm font-medium mb-2">Microphone</label>
            <Select onValueChange={(value) => onDeviceChange(value, 'audioinput')}>
              <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <SelectValue placeholder="Select microphone" />
              </SelectTrigger>
              <SelectContent>
                {audioInputs.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Camera */}
          <div>
            <label className="block text-sm font-medium mb-2">Camera</label>
            <Select onValueChange={(value) => onDeviceChange(value, 'videoinput')}>
              <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent>
                {videoInputs.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Speaker */}
          <div>
            <label className="block text-sm font-medium mb-2">Speaker</label>
            <Select onValueChange={(value) => onDeviceChange(value, 'audiooutput')}>
              <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <SelectValue placeholder="Select speaker" />
              </SelectTrigger>
              <SelectContent>
                {audioOutputs.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Speaker ${device.deviceId.slice(0, 5)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Done
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DeviceSelector;
