import Image from "next/image";

type PictureObjectProps = {
  selectedImage: File | null;
  left: number;
  top: number;
  width: number;
  height: number;
};

export const PictureObject: React.FC<PictureObjectProps> = ({
  selectedImage,
  left,
  top,
  width,
  height,
}) => {
  return (
    <div
      className="absolute bg-gray-200 flex items-center border-[0.1px] border-gray-300 justify-center"
      style={{
        left: `${left / 2.2}px`,
        top: `${top / 2.2}px`,
        width: `${width / 2.5}px`,
        height: `${height / 2.5}px`,
      }}
    >
      <Image
        src={
          selectedImage
            ? URL.createObjectURL(selectedImage)
            : "/assets/photo.jpeg"
        }
        fill
        alt={""}
        className="object-cover"
      />
    </div>
  );
};
