'use client';

import { Archive, File, FileImage, FileText, FileVideo, Music, Upload, X } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileWithPreview extends File {
  preview?: string;
}

interface FileDropzoneProps {
  onFilesChange?: (files: FileWithPreview[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  className?: string;
  disabled?: boolean;
}

interface FileDropzoneRef {
  clearFiles: () => void;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return FileImage;
  if (fileType.startsWith('video/')) return FileVideo;
  if (fileType.startsWith('audio/')) return Music;
  if (fileType === 'application/pdf') return FileText;
  if (fileType.includes('document') || fileType.includes('word')) return FileText;
  if (fileType.includes('sheet') || fileType.includes('excel')) return FileText;
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return FileText;
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z'))
    return Archive;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileDropzone = React.forwardRef<FileDropzoneRef, FileDropzoneProps>(
  (
    {
      onFilesChange,
      maxFiles = 10,
      maxSize = 10 * 1024 * 1024, // 10MB default
      acceptedFileTypes = [],
      className,
      disabled = false,
    },
    ref
  ) => {
    const [files, setFiles] = React.useState<FileWithPreview[]>([]);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const [error, setError] = React.useState<string>('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Expose clearFiles method to parent component
    React.useImperativeHandle(ref, () => ({
      clearFiles: () => {
        // Clean up previews before clearing
        files.forEach((file) => {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
        });
        setFiles([]);
        onFilesChange?.([]);
      },
    }));

    const validateFile = (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File size must be less than ${formatFileSize(maxSize)}`;
      }
      if (
        acceptedFileTypes.length > 0 &&
        !acceptedFileTypes.some((type) => file.type.match(type))
      ) {
        return `File type not supported. Accepted types: ${acceptedFileTypes.join(', ')}`;
      }
      return null;
    };

    const processFiles = (fileList: FileList) => {
      const newFiles: FileWithPreview[] = [];
      const errors: string[] = [];

      Array.from(fileList).forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(`${file.name}: ${validationError}`);
          return;
        }

        if (files.length + newFiles.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed`);
          return;
        }

        const fileWithPreview = file as FileWithPreview;

        // Create preview for images
        if (file.type.startsWith('image/')) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }

        newFiles.push(fileWithPreview);
      });

      if (errors.length > 0) {
        setError(errors[0]);
        setTimeout(() => setError(''), 5000);
      } else {
        setError('');
      }

      if (newFiles.length > 0) {
        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        onFilesChange?.(updatedFiles);
      }
    };

    const removeFile = (index: number) => {
      const fileToRemove = files[index];
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }

      const updatedFiles = files.filter((_, i) => i !== index);
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        processFiles(droppedFiles);
      }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        processFiles(selectedFiles);
      }
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const openFileDialog = () => {
      if (!disabled && fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    // Cleanup previews on unmount
    React.useEffect(() => {
      return () => {
        files.forEach((file) => {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
        });
      };
    }, [files]);

    return (
      <div className={cn('w-full space-y-4', className)}>
        {/* Dropzone Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-2 text-center cursor-pointer transition-colors',
            isDragOver && !disabled
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-destructive'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            accept={acceptedFileTypes.join(',')}
            disabled={disabled}
          />

          <div className="flex flex-row items-center gap-4 justify-center ">
            <div className={cn('rounded-full p-4', isDragOver ? 'bg-primary/10' : 'bg-muted')}>
              <Upload
                className={cn('h-8 w-8', isDragOver ? 'text-primary' : 'text-muted-foreground')}
              />
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-muted-foreground">or click to browse files</p>
              <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
                {maxFiles > 1 && <Badge variant="secondary">Max {maxFiles} files</Badge>}
                <Badge variant="secondary">Max {formatFileSize(maxSize)}</Badge>
                {acceptedFileTypes.length > 0 && (
                  <Badge variant="secondary">
                    {acceptedFileTypes.map((type) => type.split('/')[1]).join(', ')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">
              Uploaded Files ({files.length}/{maxFiles})
            </h4>
            <div className="grid gap-3">
              {files.map((file, index) => {
                const IconComponent = getFileIcon(file.type);

                return (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {/* File Icon or Image Preview */}
                        <div className="flex-shrink-0">
                          {file.preview ? (
                            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={file.preview || '/placeholder.svg'}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                              <IconComponent className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span className="capitalize">
                              {file.type.split('/')[1] || 'Unknown'}
                            </span>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);

FileDropzone.displayName = 'FileDropzone';
