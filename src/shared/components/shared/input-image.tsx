"use client"
import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Image from 'next/image';

interface Props {
  className?: string;
}

export const InputImage: React.FC<Props> = ({ className }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file))
        }
    };
    const handleButtonClick = () => {
        inputRef.current?.click();
    };
    

    return (
    <div className={className}>
        {imageFile?.name && <div>
            <Image width={100} height={100} src={imageUrl} alt={''}/>    
        </div>}    
    <div>
    <Input
      type="file"
      ref={inputRef}
      accept="image/*"
      className="hidden"
      onChange={handleFileChange}
    />
    <Button
      onClick={handleButtonClick}
      type="button"
      className="px-4 py-2 text-xs bg-[#2592a5] text-white rounded-lg"
    >
      {imageFile?.name ? "Изменить файл" : "Добавить изображение"}
    </Button>
  </div>
</div>
  );
};