"use client";
import React from "react";
import { parseStringPromise } from "xml2js";
import TemplateViewer from "./template-viewer";
import TemplateImageUploader from "./add-template";

interface Props {
  className?: string;
}

export const Templates: React.FC<Props> = ({ className }) => {
  const rootUrl = process.env.NEXT_PUBLIC_API_URL;
  const credentials = btoa(
    `${process.env.NEXT_PUBLIC_USERNAME}:${process.env.NEXT_PUBLIC_PASSWORD}`
  );
  const [rootId, setRootId] = React.useState<string | null>(null);
  const [hack2025Id, setHack2025Id] = React.useState<string | null>(null);
  const [hack2025Files, setHack2025Files] = React.useState<any[] | null>(null);
  const [dowloadedFiles, setDownloadedFiles] = React.useState<any[]>([]);
  const [selectedTemplate, setTemplate] = React.useState<string>("");
  const [image, setImage] = React.useState<File | null>(null);

  const getRoot = async () => {
    try {
      const response = await fetch(`${rootUrl}/Templates/Root`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Error fetching root folder:", error);
      return null;
    }
  };

  const getFile = async (id: string) => {
    try {
      const response = await fetch(
        `https://hygieia.fast-report.com/download/t/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      const parsedData = await parseStringPromise(data);
      return { parsedData, data };
    } catch (error) {
      console.error("Error fetching folders and files:", error);
      return null;
    }
  };

  const getFoldersAndFiles = async (id: string) => {
    try {
      const response = await fetch(
        `${rootUrl}/Templates/Folder/${id}/ListFolderAndFiles`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching folders and files:", error);
      return null;
    }
  };

  const findHack2025 = async (rootId: string) => {
    const data = await getFoldersAndFiles(rootId);

    if (data) {
      const hack2025Folder = data.files.find(
        (item: any) => item.name === "hac2025" && item.type === "Folder"
      );

      if (hack2025Folder) {
        setHack2025Id(hack2025Folder.id);
        const hack2025Data = await getFoldersAndFiles(hack2025Folder.id);
        if (hack2025Data) {
          setHack2025Files(hack2025Data.files);
        }
      } else {
        console.log("Folder 'hac2025' not found.");
      }
    }
  };

  React.useEffect(() => {
    const initialize = async () => {
      if (hack2025Files?.length && hack2025Files?.length > 0) {
        for (const file of hack2025Files) {
          const { parsedData: fileData, data: fileDataStr } = await getFile(
            file.id
          );
          const resultData = {
            fileId: file.id,
            fileData,
            fileDataStr,
          };
          setDownloadedFiles((previous) => [...previous, resultData]);
        }
      }
    };
    initialize();
  }, [hack2025Files]);

  React.useEffect(() => {
    console.log(selectedTemplate);
  }, [selectedTemplate]);

  React.useEffect(() => {
    const initialize = async () => {
      const currentRoot = await getRoot();
      if (currentRoot) {
        setRootId(currentRoot);
        findHack2025(currentRoot);
      }
    };
    initialize();
  }, []);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <div>Выберите шаблон:</div>
        <div className="grid grid-cols-2 gap-8 mx-auto w-full">
          {dowloadedFiles.length > 0 &&
            dowloadedFiles.map((file, index) => (
              <div
                key={index}
                onClick={() => setTemplate(file.fileId)}
                className={
                  selectedTemplate === file.fileId
                    ? "border border-red-300 rounded-md"
                    : ""
                }
              >
                <TemplateViewer file={file.fileData} selectedImage={image} />
              </div>
            ))}
        </div>
      </div>

      {selectedTemplate && (
        <div>
          <TemplateImageUploader
            folderId={hack2025Id || ""}
            image={image}
            setImage={setImage}
            templateFile={
              dowloadedFiles.find((file) => file.fileId === selectedTemplate)
                ?.fileDataStr
            }
          />
        </div>
      )}
    </div>
  );
};
