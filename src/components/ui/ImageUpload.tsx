'use client';

import { useState, useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  size?: number;
}

export function ImageUpload({ value, onChange, size = 80 }: ImageUploadProps) {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="relative inline-block">
      <div
        className="relative rounded-full overflow-hidden cursor-pointer transition-all hover:scale-105"
        style={{ width: size, height: size }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {value ? (
          <img
            src={value}
            alt="头像预览"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary/50 flex flex-col items-center justify-center border-2 border-dashed border-input rounded-full">
            <Camera className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        
        {(isHovered || value) && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-full transition-all">
            <Upload className="w-6 h-6 text-white mb-1" />
            <span className="text-xs text-white">{value ? '更换' : '上传'}</span>
          </div>
        )}
      </div>

      {value && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-all shadow-md"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
