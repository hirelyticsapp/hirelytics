# Interview Monitoring System

This system provides camera and screen monitoring capabilities for interview sessions, allowing automated capture and secure storage of monitoring images to S3.

## Overview

The monitoring system consists of:

1. **Server Actions** - Handle uploading and managing monitoring images
2. **React Hook** - Provides easy client-side interface for monitoring operations
3. **React Component** - Complete UI for interview monitoring
4. **S3 Integration** - Secure image storage and signed URL generation

## Server Actions

### File: `src/actions/job-application.ts`

#### `uploadMonitoringImage(applicationId, imageType, imageData)`

Uploads a base64 encoded image to S3 and saves the reference in the database.

**Parameters:**

- `applicationId`: String - The job application ID
- `imageType`: 'camera' | 'screen' - Type of monitoring image
- `imageData`: String - Base64 encoded image data

**Returns:**

```typescript
{
  success: boolean;
  message: string;
  s3Key: string;
  timestamp: string;
}
```

#### `uploadCameraImage(applicationId, imageData)`

Convenience function for uploading camera images.

#### `uploadScreenImage(applicationId, imageData)`

Convenience function for uploading screen images.

#### `getMonitoringImages(applicationId)`

Retrieves all monitoring images for an application (with proper access control).

#### `deleteMonitoringImage(applicationId, imageType, s3Key)`

Deletes a monitoring image from both S3 and the database (recruiters/admins only).

### File: `src/actions/s3-operation.ts`

#### `getMonitoringImageSignedUrl(s3Key)`

Generates a signed URL for viewing a monitoring image.

#### `getMonitoringImageSignedUrls(s3Keys)`

Generates signed URLs for multiple monitoring images.

## React Hook

### File: `src/hooks/use-monitoring-images.ts`

The `useMonitoringImages` hook provides:

```typescript
const {
  uploadCamera, // Upload camera image
  uploadScreen, // Upload screen image
  getImages, // Get all monitoring images
  getImageUrl, // Get signed URL for single image
  getImageUrls, // Get signed URLs for multiple images
  deleteImage, // Delete monitoring image
  captureScreen, // Utility: Capture from video element
  captureCamera, // Utility: Capture from video element
  isUploading, // Upload state
  uploadError, // Error state
} = useMonitoringImages();
```

## React Component

### File: `src/components/monitoring-panel.tsx`

Complete monitoring UI component with camera preview and automatic capture.

**Usage:**

```tsx
import { MonitoringPanel } from '@/components/monitoring-panel';

<MonitoringPanel
  applicationId="application-id"
  cameraMonitoring={true}
  screenMonitoring={true}
  cameraInterval={30} // seconds
  screenInterval={30} // seconds
/>;
```

**Features:**

- Live camera preview
- Automatic screen sharing detection
- Configurable capture intervals
- Manual capture buttons
- Upload status indicators
- Role-based access control

## Database Schema

Monitoring images are stored in the `JobApplication` model:

```typescript
monitoringImages: {
  camera: [{
    s3Key: string;
    timestamp: Date;
  }],
  screen: [{
    s3Key: string;
    timestamp: Date;
  }]
}
```

## S3 Storage Structure

Images are stored with the following key pattern:

```
monitoring/{applicationId}/camera/{timestamp}-{uuid}.jpg
monitoring/{applicationId}/screen/{timestamp}-{uuid}.jpg
```

## Access Control

### Uploads

- **Candidates**: Can only upload images for their own applications
- **Recruiters**: Can upload images for applications in their organization
- **Admins**: Can upload images for any application

### Viewing

- **Candidates**: Can only view images for their own applications
- **Recruiters**: Can view images for applications in their organization
- **Admins**: Can view all monitoring images

### Deletion

- **Candidates**: Cannot delete monitoring images
- **Recruiters**: Can delete images for applications in their organization
- **Admins**: Can delete any monitoring images

## Example Usage

### Basic Upload

```typescript
import { uploadCameraImage } from '@/actions/job-application';

// Capture image from video element
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
ctx.drawImage(video, 0, 0);
const imageData = canvas.toDataURL('image/jpeg', 0.8);

// Upload to S3
const result = await uploadCameraImage(applicationId, imageData);
```

### Using the Hook

```typescript
import { useMonitoringImages } from '@/hooks/use-monitoring-images';

function InterviewComponent({ applicationId }) {
  const { uploadCamera, captureCamera, isUploading } = useMonitoringImages();
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleCapture = async () => {
    if (videoRef.current) {
      const imageData = captureCamera(videoRef.current);
      await uploadCamera(applicationId, imageData);
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay muted />
      <button onClick={handleCapture} disabled={isUploading}>
        Capture Image
      </button>
    </div>
  );
}
```

### Viewing Images

```typescript
import { getMonitoringImages } from '@/actions/job-application';
import { getMonitoringImageSignedUrls } from '@/actions/s3-operation';

// Get all monitoring images
const images = await getMonitoringImages(applicationId);

// Generate signed URLs for viewing
const cameraKeys = images.camera.map((img) => img.s3Key);
const screenKeys = images.screen.map((img) => img.s3Key);

const cameraUrls = await getMonitoringImageSignedUrls(cameraKeys);
const screenUrls = await getMonitoringImageSignedUrls(screenKeys);
```

## Environment Variables

Ensure the following environment variables are configured:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_ENDPOINT_URL_S3=your_endpoint_url (optional, for custom S3 providers)
```

## Security Considerations

1. **Image Data**: All images are stored securely in S3 with proper access controls
2. **Signed URLs**: Generated with 1-hour expiration for security
3. **Role-based Access**: Strict access control based on user roles and organization membership
4. **Data Encryption**: Images are stored with S3 encryption
5. **HTTPS Only**: All uploads and downloads use secure HTTPS connections

## Error Handling

The system includes comprehensive error handling:

- **Network Errors**: Automatic retry and user feedback
- **Permission Errors**: Clear error messages for unauthorized access
- **Storage Errors**: Fallback mechanisms and error logging
- **Validation Errors**: Input validation and sanitization

## Performance Considerations

1. **Image Compression**: Images are compressed to JPEG format with 80% quality
2. **Batch Operations**: Multiple image URLs generated in batch for efficiency
3. **Lazy Loading**: Images loaded on-demand with signed URLs
4. **Cleanup**: Automatic cleanup of streams and resources
