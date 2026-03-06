'use client';

import { useCallback, useRef, useState } from 'react';

interface UploadZoneProps {
  label: string;
  image: string | null;
  onImageChange: (base64: string | null) => void;
  accept?: string;
}

export default function UploadZone({
  label,
  image,
  onImageChange,
  accept = 'image/png,image/jpeg,image/webp',
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Format non supporté. Utilisez PNG, JPG ou WebP.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onImageChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
          isDragging
            ? 'border-brand-violet bg-brand-violet/5'
            : image
            ? 'border-gray-200 bg-white'
            : 'border-gray-300 bg-gray-50 hover:border-brand-violet hover:bg-brand-violet/5'
        }`}
      >
        {image ? (
          <>
            <img
              src={image}
              alt={label}
              className="max-h-[240px] w-full rounded-lg object-contain p-2"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onImageChange(null);
              }}
              className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-500 shadow-sm transition hover:bg-red-50 hover:text-red-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500">
              Glissez une image ou <span className="text-brand-violet font-medium">cliquez pour parcourir</span>
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, WebP</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
