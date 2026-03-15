'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  onUploadComplete: (result: any) => void;
  accept: string;
  maxSize: number; // bytes
  maxFiles: number;
  multiple: boolean;
  disabled: boolean;
  className: string;
}

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error: string;
}

export function FileUpload({
  onFileSelect,
  onUploadComplete,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  multiple = true,
  disabled = false,
  className = '',
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `文件大小不能超过 ${formatFileSize(maxSize)}`;
    }

    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();

      const isValid = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          // Extension check
          return fileName.endsWith(type.toLowerCase());
        } else {
          // MIME type check
          return (
            fileType === type.toLowerCase() ||
            (type.endsWith('/*') && fileType.startsWith(type.slice(0, -1)))
          );
        }
      });

      if (!isValid) {
        return `不支持的文件类型。支持的类型: ${accept}`;
      }
    }

    return null;
  };

  const handleFileSelect = useCallback(
    (selectedFiles: FileList | File[]) => {
      const fileList = Array.from(selectedFiles);
      const validFiles: UploadFile[] = [];
      const errors: string[] = [];

      fileList.forEach(file => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push({
            file,
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            status: 'pending',
            progress: 0,
          });
        }
      });

      if (errors.length > 0) {
        alert(`以下文件有问\n${errors.join('\n')}`);
      }

      if (validFiles.length > 0) {
        const newFiles = [...files, ...validFiles].slice(0, maxFiles);
        setFiles(newFiles);
        onFileSelect(newFiles.map(f => f.file));
      }
    },
    [files, maxFiles, maxSize, accept, onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const newFiles = files.filter(f => f.id !== fileId);
    setFiles(newFiles);
    onFileSelect(newFiles.map(f => f.file));
  };

  const triggerUpload = async () => {
    // Simulate upload process
    const uploadingFiles = files.map(file => ({
      ...file,
      status: 'uploading' as const,
      progress: 0,
    }));

    setFiles(uploadingFiles);

    // Simulate progress
    uploadingFiles.forEach(async (file, index) => {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFiles(prev =>
          prev.map(f => (f.id === file.id  { ...f, progress } : f))
        );
      }

      // Simulate completion
      setTimeout(() => {
        setFiles(prev =>
          prev.map(f =>
            f.id === file.id  { ...f, status: 'success', progress: 100 } : f
          )
        );

        if (onUploadComplete) {
          onUploadComplete({
            fileId: file.id,
            fileName: file.file.name,
            fileSize: file.file.size,
          });
        }
      }, 1000);
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
             'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled  'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={e => {
            if (e.target.files) {
              handleFileSelect(e.target.files);
            }
          }}
          className="hidden"
        />

        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          拖拽文件到这里或点击选择
        </p>
        <p className="text-sm text-gray-500">
          支持 {accept} 格式，单个文件最{formatFileSize(maxSize)}
          {multiple && `, 最${maxFiles} 个文件`}
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">
              已选择的文({files.length})
            </h3>
            <Button
              onClick={triggerUpload}
              disabled={files.some(f => f.status === 'uploading')}
              size="sm"
            >
              {files.some(f => f.status === 'uploading')  (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  上传..
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  开始上                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            {files.map(uploadFile => (
              <div
                key={uploadFile.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <File className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {uploadFile.status === 'pending' && (
                    <span className="text-sm text-gray-500">待上/span>
                  )}

                  {uploadFile.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadFile.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-blue-600">
                        {uploadFile.progress}%
                      </span>
                    </div>
                  )}

                  {uploadFile.status === 'success' && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-1" />
                      <span className="text-sm">上传成功</span>
                    </div>
                  )}

                  {uploadFile.status === 'error' && (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="w-5 h-5 mr-1" />
                      <span className="text-sm">上传失败</span>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(uploadFile.id)}
                    disabled={uploadFile.status === 'uploading'}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

