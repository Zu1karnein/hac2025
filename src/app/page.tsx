import TemplateImageUploader from "@/shared/components/shared/add-template";
import { InputImage } from "@/shared/components/shared/input-image";
import TemplateViewer from "@/shared/components/shared/template-viewer";
import { Templates } from "@/shared/components/shared/templates";

export default function Home() {
  return (
    <div className="min-h-screen flex justify-center items-center h-screen max-w-[1080px] mx-auto">
      <main className="flex flex-col gap-8 p-4 items-center justify-center">
        <Templates />
      </main>
    </div>
  );
}
