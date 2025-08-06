"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadTargetIndex = useRef<number | null>(null);

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "my_preset");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dqbfjahy6/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (data.secure_url) {
        onChange(data.secure_url);
        toast.success("Image uploaded successfully.");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast.error("Something went wrong during upload.");
    } finally {
      setLoadingIndex(null);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (uploadTargetIndex.current !== null) {
        setLoadingIndex(uploadTargetIndex.current);
        handleUpload(e.target.files[0]);
      }
    }
    e.target.value = "";
  };

  const handlePlaceholderClick = (index: number) => {
    if (disabled || loadingIndex !== null) return;
    uploadTargetIndex.current = index;
    inputRef.current?.click();
  };

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {value.map((url, index) => (
          <div
            key={url}
            className="relative w-full aspect-square rounded-md overflow-hidden"
          >
            <div className="z-10 absolute right-1 top-1">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="icon"
                className="w-6 h-6 cursor-pointer rounded-full"
                disabled={loadingIndex !== null}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Image fill className="object-cover" alt="Image" src={url} />
          </div>
        ))}

        {value.length < 4 &&
          Array.from({ length: 4 - value.length }).map((_, i) => {
            const absoluteIndex = value.length + i;
            const isLoading = loadingIndex === absoluteIndex;
            return (
              <div
                key={`placeholder-${absoluteIndex}`}
                onClick={() => handlePlaceholderClick(absoluteIndex)}
                className="relative w-full aspect-square rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 transition"
                data-disabled={isLoading || disabled}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-5 h-5 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500 mt-2">Uploading</p>
                  </div>
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">Upload</p>
                  </>
                )}
              </div>
            );
          })}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onFileSelect}
        disabled={disabled || loadingIndex !== null || value.length >= 4}
      />
    </div>
  );
};

export default ImageUpload;