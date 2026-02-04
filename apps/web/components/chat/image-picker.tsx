'use client';

import { useRef, useState, useCallback } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImagePickerProps {
  onImageSelected: (file: File) => void;
  isUploading?: boolean;
  disabled?: boolean;
}

export function ImagePicker({ onImageSelected, isUploading, disabled }: ImagePickerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setSelectedFile(file);
      setDialogOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedFile) {
      onImageSelected(selectedFile);
      setDialogOpen(false);
      setPreview(null);
      setSelectedFile(null);
    }
  }, [selectedFile, onImageSelected]);

  const handleCancel = useCallback(() => {
    setDialogOpen(false);
    setPreview(null);
    setSelectedFile(null);
  }, []);

  if (isUploading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        title="Send image"
      >
        <ImagePlus className="h-5 w-5" />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Image</DialogTitle>
          </DialogHeader>

          <div className="relative">
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-[400px] object-contain rounded-lg"
              />
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="forma" onClick={handleConfirm}>
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
