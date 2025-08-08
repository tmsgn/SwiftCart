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
  value?: string; // single image URL (optional)
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
    // reset input so the same file can be selected again if needed
    e.target.value = "";
  };

  const openPicker = () => {
    if (disabled || loading) return;
    inputRef.current?.click();
  };

  return (
    <div className="inline-block">
      {value ? (
        <div className="relative w-[140px] h-[96px] rounded-md overflow-hidden border">
          <div className="z-10 absolute right-1 top-1">
            <Button
              type="button"
              onClick={() => onRemove(value)}
              variant="destructive"
              size="icon"
              className="w-6 h-6 cursor-pointer rounded-full"
              disabled={loading || disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Image fill className="object-cover" alt="Image" src={value} />
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          className="relative w-[140px] h-[96px] rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 transition bg-white"
          disabled={disabled || loading}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-5 h-5 border-b-2 border-gray-900 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 mt-2">Uploading</p>
            </div>
          ) : (
            <>
              <ImagePlus className="h-6 w-6 text-gray-400" />
              <p className="text-sm text-gray-500 mt-1">Upload</p>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onFileSelect}
        disabled={disabled || loading}
      />
    </div>
  );
};

export default ImageUpload;
