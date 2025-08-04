"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  UploadIcon,
  X as XIcon,
  AlertCircle as AlertCircleIcon,
  ImageIcon,
  Trash2Icon,
} from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string[];
  onChange: (url: string) => void;
  onRemove: (url: string) => void;
  disabled?: boolean;
}

const MAX_FILES = 6;
const MAX_SIZE_MB = 5;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadFiles(e.target.files);
  };

  const handleClick = () => {
    if (!disabled && !uploading && value.length < MAX_FILES) {
      inputRef.current?.click();
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || uploading || value.length >= MAX_FILES) return;
    await uploadFiles(e.dataTransfer.files);
  };

  const uploadFiles = async (files: FileList | null) => {
    setErrors([]);
    if (!files) return;

    if (value.length + files.length > MAX_FILES) {
      toast.error(`You can only upload up to ${MAX_FILES} images.`);
      return;
    }

    setUploading(true);
    const newErrors: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > MAX_SIZE) {
        newErrors.push(`${file.name} exceeds ${MAX_SIZE_MB}MB`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "my_preset");

      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dqbfjahy6/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        if (data.secure_url) {
          onChange(data.secure_url);
        } else {
          newErrors.push(`${file.name} upload failed.`);
        }
      } catch {
        newErrors.push(`${file.name} upload failed.`);
      }
    }

    if (newErrors.length > 0) setErrors(newErrors);
    setUploading(false);
  };

  const handleRemoveAll = () => {
    value.forEach(onRemove);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-files={value.length > 0 || undefined}
        className={clsx(
          "border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]",
          { "opacity-50 cursor-not-allowed": disabled || uploading }
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          hidden
          disabled={disabled || uploading || value.length >= MAX_FILES}
        />

        {value.length > 0 ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-medium">
                Uploaded Files ({value.length})
              </h3>
              <div className="flex gap-2 flex-wrap justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClick}
                  disabled={value.length >= MAX_FILES}
                >
                  <UploadIcon className="-ms-0.5 size-3.5 opacity-60" />
                  Add more
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAll}
                  disabled={value.length === 0}
                >
                  <Trash2Icon className="-ms-0.5 size-3.5 opacity-60" />
                  Remove all
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {value.map((url) => (
                <div
                  key={url}
                  className="bg-accent relative aspect-square w-[120px] rounded-md"
                >
                  <Image
                    src={url}
                    alt="Uploaded"
                    fill
                    className="rounded-[inherit] object-cover"
                  />
                  <Button
                    type="button"
                    onClick={() => onRemove(url)}
                    size="icon"
                    className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                    aria-label="Remove image"
                    variant="destructive"
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
            <div className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border">
              <ImageIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">
              Drop your images here
            </p>
            <p className="text-muted-foreground text-xs">
              PNG, JPG, GIF (max. {MAX_SIZE_MB}MB)
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={handleClick}
              disabled={disabled || uploading || value.length >= MAX_FILES}
            >
              <UploadIcon className="-ms-1 opacity-60" />
              {uploading
                ? "Uploading...": "Select images"}
            </Button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs mt-2"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  );
};
