import { PictureObject } from "./picture-object";

type ReportPageProps = {
  selectedImage: File | null;
  objects: Array<{
    Name: string;
    Left: number;
    Top: number;
    Width: number;
    Height: number;
  }>;
};

export const ReportPage: React.FC<ReportPageProps> = ({
  selectedImage,
  objects,
}) => {
  return (
    <div className="relative w-[300px] rounded-md p-4 h-[150px] border border-gray-300 bg-white overflow-hidden">
      {objects.map((obj, index) => (
        <PictureObject
          selectedImage={selectedImage}
          key={index}
          left={obj.Left}
          top={obj.Top}
          width={obj.Width}
          height={obj.Height}
        />
      ))}
    </div>
  );
};
