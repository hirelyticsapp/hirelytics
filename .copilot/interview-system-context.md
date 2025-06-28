# Interview System & AI Integration Context

## Overview

This document provides comprehensive context about the interview system architecture, AI integration patterns, and real-time features in the Hirelytics platform.

## Interview System Architecture

### Core Interview Components

```
Interview Flow:
1. Device Check → 2. Pre-Interview Setup → 3. Interview Session → 4. Post-Interview

Components:
├── InterviewClient (Main orchestrator)
├── DeviceCheck (Hardware testing)
├── InterviewStartScreen (Pre-interview prep)
├── VideoCall (Main interview interface)
├── ChatTranscript (Real-time conversation)
├── MonitoringSystem (Screen/camera capture)
└── InterviewEndScreen (Session completion)
```

### Interview Session Management

```typescript
// Interview Session State
interface InterviewSessionState {
  sessionId: string;
  jobApplicationId: string;
  status: 'preparing' | 'device-check' | 'starting' | 'active' | 'paused' | 'completed';
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number;
  transcript: ChatMessage[];
  monitoringData: {
    screenCaptures: CaptureData[];
    cameraCaptures: CaptureData[];
  };
}

// Interview Configuration
interface InterviewConfig {
  duration: number; // minutes
  difficultyLevel: 'easy' | 'normal' | 'hard' | 'expert' | 'advanced';
  screenMonitoring: boolean;
  screenMonitoringMode: 'photo' | 'video';
  screenMonitoringInterval: 30 | 60; // seconds
  cameraMonitoring: boolean;
  cameraMonitoringMode: 'photo' | 'video';
  cameraMonitoringInterval: 30 | 60; // seconds
  instructions?: string;
}
```

## AI Integration Patterns

### Question Generation System

```typescript
// AI Question Generation Request
interface QuestionGenerationRequest {
  jobTitle: string;
  jobDescription: string;
  skills: string[];
  industry: string;
  difficultyLevel: string;
  questionTypes: string[];
  totalQuestions: number;
  categoryConfigs: QuestionCategoryConfig[];
}

// AI Generated Questions Response
interface AIGeneratedQuestion {
  id: string;
  question: string;
  type: 'technical' | 'behavioral' | 'analytical' | 'clinical';
  category: string;
  difficultyLevel: string;
  expectedAnswerPoints: string[];
  followUpQuestions?: string[];
  timeLimit?: number;
}
```

### AI Service Integration

```typescript
// AI Service Endpoints
const AI_ENDPOINTS = {
  GENERATE_QUESTIONS: '/api/ai/generate-questions',
  GENERATE_DESCRIPTION: '/api/ai/generate-description',
  ANALYZE_RESPONSE: '/api/ai/analyze-response', // Future feature
};

// AI Request Pattern
async function callAIService<T>(endpoint: string, payload: any): Promise<AIResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('AI service call failed:', error);
    throw error;
  }
}
```

## Real-Time Features

### WebRTC Integration

```typescript
// Media Stream Management
interface MediaStreamConfig {
  video: boolean;
  audio: boolean;
  screen?: boolean;
}

// WebRTC Connection Patterns
class InterviewWebRTC {
  private peerConnection: RTCPeerConnection;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  async initializeConnection(config: MediaStreamConfig) {
    // Initialize peer connection
    // Setup media streams
    // Handle ICE candidates
    // Manage connection state
  }

  async startScreenShare() {
    // Screen capture implementation
  }

  async captureSnapshot() {
    // Camera/screen snapshot capture
  }
}
```

### Monitoring System

```typescript
// Monitoring Data Capture
interface CaptureData {
  timestamp: Date;
  type: 'screen' | 'camera';
  s3Key: string;
  metadata?: {
    windowTitle?: string;
    activeApplication?: string;
    mousePosition?: { x: number; y: number };
  };
}

// Monitoring Service
class MonitoringService {
  private captureInterval: NodeJS.Timeout | null = null;

  startMonitoring(config: MonitoringConfig) {
    // Start scheduled captures
    // Upload to S3
    // Store metadata
  }

  async captureScreen(): Promise<CaptureData> {
    // Screen capture logic
  }

  async captureCamera(): Promise<CaptureData> {
    // Camera capture logic
  }
}
```

## Device Management

### Hardware Testing

```typescript
// Device Check Implementation
interface DeviceCheckResult {
  camera: {
    available: boolean;
    permissions: boolean;
    quality: 'good' | 'fair' | 'poor';
  };
  microphone: {
    available: boolean;
    permissions: boolean;
    level: number; // 0-100
  };
  screen: {
    shareSupported: boolean;
    permissions: boolean;
  };
  browser: {
    compatible: boolean;
    webRTCSupported: boolean;
    mediaDevicesSupported: boolean;
  };
}

// Device Testing Patterns
async function performDeviceCheck(): Promise<DeviceCheckResult> {
  // Test camera access
  // Test microphone access
  // Test screen sharing
  // Check browser compatibility
  // Return comprehensive results
}
```

### Permission Management

```typescript
// Permission Request Patterns
async function requestDevicePermissions() {
  try {
    // Request camera and microphone
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // Test screen sharing capability
    if (navigator.mediaDevices.getDisplayMedia) {
      // Screen sharing supported
    }

    return { granted: true, stream };
  } catch (error) {
    // Handle permission denied
    return { granted: false, error };
  }
}
```

## Interview Question System

### Question Configuration

```typescript
// Question Category Configuration
interface QuestionCategoryConfig {
  category: string;
  percentage: number; // 0-100
  minQuestions: number;
  maxQuestions: number;
}

// Question Types
type QuestionType =
  | 'technical' // Coding, system design, technical concepts
  | 'behavioral' // Situational, experience-based
  | 'analytical' // Problem-solving, logical reasoning
  | 'clinical'; // Domain-specific expertise

// Question Management
interface QuestionConfig {
  mode: 'manual' | 'ai-mode';
  totalQuestions: number;
  categoryConfigs: QuestionCategoryConfig[];
  questionTypes: QuestionType[];
  questions?: Question[]; // For manual mode
}
```

### Dynamic Question Flow

```typescript
// Question Progression Logic
class QuestionManager {
  private questions: Question[];
  private currentIndex: number = 0;
  private responses: QuestionResponse[] = [];

  constructor(private config: QuestionConfig) {
    this.questions = this.initializeQuestions();
  }

  getCurrentQuestion(): Question {
    return this.questions[this.currentIndex];
  }

  recordResponse(response: QuestionResponse) {
    this.responses.push(response);
  }

  proceedToNext(): Question | null {
    this.currentIndex++;
    return this.currentIndex < this.questions.length ? this.questions[this.currentIndex] : null;
  }

  getProgress(): { current: number; total: number; percentage: number } {
    return {
      current: this.currentIndex + 1,
      total: this.questions.length,
      percentage: Math.round(((this.currentIndex + 1) / this.questions.length) * 100),
    };
  }
}
```

## File Upload & Storage Patterns

### S3 Integration for Interview Data

```typescript
// S3 Upload Patterns for Interview Content
interface S3UploadConfig {
  bucket: string;
  key: string;
  contentType: string;
  metadata?: Record<string, string>;
}

// Interview File Types
type InterviewFileType =
  | 'screen-capture'
  | 'camera-capture'
  | 'audio-recording'
  | 'transcript'
  | 'session-metadata';

// Upload Service
class InterviewFileUploadService {
  async uploadInterviewFile(
    file: Blob,
    type: InterviewFileType,
    sessionId: string
  ): Promise<string> {
    // Generate S3 key with proper structure
    // Upload with metadata
    // Return S3 URL
  }

  async generateSignedUrl(s3Key: string): Promise<string> {
    // Generate time-limited access URL
  }
}
```

## Error Handling & Recovery

### Interview Session Error Recovery

```typescript
// Error Recovery Patterns
interface InterviewError {
  type: 'connection' | 'permission' | 'device' | 'upload' | 'ai-service';
  message: string;
  recoverable: boolean;
  retryCount?: number;
}

class InterviewErrorHandler {
  async handleError(error: InterviewError): Promise<boolean> {
    switch (error.type) {
      case 'connection':
        return await this.recoverConnection();
      case 'device':
        return await this.retryDeviceAccess();
      case 'upload':
        return await this.retryUpload();
      default:
        return false;
    }
  }

  private async recoverConnection(): Promise<boolean> {
    // Attempt to reconnect WebRTC
    // Fallback to alternative connection method
  }
}
```

## Performance Optimization

### Interview System Performance

```typescript
// Performance Monitoring
interface PerformanceMetrics {
  connectionLatency: number;
  videoQuality: 'low' | 'medium' | 'high';
  audioQuality: number; // 0-100
  uploadSpeed: number; // Mbps
  processingDelay: number; // ms
}

// Optimization Strategies
class InterviewPerformanceOptimizer {
  async optimizeForConnection(metrics: PerformanceMetrics) {
    // Adjust video quality based on connection
    // Optimize capture intervals
    // Implement adaptive bitrate
  }

  async preloadResources() {
    // Preload AI models
    // Initialize WebRTC components
    // Prepare upload infrastructure
  }
}
```

## Development Patterns

### Interview Component Patterns

```typescript
// Standard Interview Component Structure
interface InterviewComponentProps {
  sessionId: string;
  config: InterviewConfig;
  onStateChange: (state: InterviewState) => void;
  onError: (error: InterviewError) => void;
}

// Hook Patterns for Interview Features
function useInterviewSession(sessionId: string) {
  // Session state management
  // Real-time updates
  // Error handling
}

function useMediaStream(config: MediaStreamConfig) {
  // Stream management
  // Device switching
  // Quality adjustment
}

function useMonitoring(config: MonitoringConfig) {
  // Capture scheduling
  // Upload management
  // Data storage
}
```

This context provides comprehensive coverage of the interview system architecture, enabling Copilot to understand and suggest appropriate patterns for interview-related features, AI integration, and real-time functionality.
