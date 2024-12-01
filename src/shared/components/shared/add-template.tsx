"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";

interface TemplateImageUploaderProps {
  image: File | null;
  setImage: (file: File) => void;
  templateFile?: any;
  folderId: string;
  className?: string; // Your authentication token
}

const TemplateImageUploader: React.FC<TemplateImageUploaderProps> = ({
  image,
  setImage,
  templateFile,
  folderId,
}) => {
  const [loading, setLoading] = useState(false);
  const credentials = btoa(
    `${process.env.NEXT_PUBLIC_USERNAME}:${process.env.NEXT_PUBLIC_PASSWORD}`
  );

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  async function generateReportWithImage(image: File, templateXmlString: any) {
    setLoading(true);

    try {
      // 1. Конвертируем изображение в base64
      const reader = new FileReader();
      reader.readAsDataURL(image);
      const base64Image = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      // 2. Парсим XML напрямую из строки
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(templateXmlString, "text/xml"); // <--- Используем templateXmlString

      // 3. Находим все PictureObject и добавляем base64
      const pictureObjects = xmlDoc.querySelectorAll("PictureObject");
      pictureObjects.forEach((pictureObject) => {
        pictureObject.setAttribute("Image", base64Image);
        pictureObject.setAttribute("ImageFormat", "jpeg");
      });

      // 4. Сериализуем модифицированный XML обратно в строку
      const modifiedTemplateXml = new XMLSerializer().serializeToString(xmlDoc);

      // 3. Загрузка модифицированного шаблона
      const templateFormData = new FormData();
      const templateBlob = new Blob([modifiedTemplateXml], {
        type: "text/xml",
      });

      templateFormData.append(
        "FileContent",
        templateBlob,
        "modified_template.frx"
      );

      const uploadTemplateResponse = await fetch(
        `https://hygieia.fast-report.com/api/rp/v2/Templates/Folder/${folderId}/File`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
          },
          body: templateFormData,
        }
      );

      if (!uploadTemplateResponse.ok) {
        throw new Error(
          `Ошибка загрузки шаблона: ${uploadTemplateResponse.status}`
        );
      }

      const templateUploadedData = await uploadTemplateResponse.json();
      const templateId = templateUploadedData.id;
      console.log(templateId);

      const repairsRoot = await fetch(
        `https://hygieia.fast-report.com/api/rp/v1/Reports/Root`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      const repairData = await repairsRoot.json();
      const rapairRootId = repairData.id;

      const exportsRoot = await fetch(
        `https://hygieia.fast-report.com/api/rp/v1/Exports/Root`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      const exportsData = await exportsRoot.json();
      const exportsRootId = exportsData.id;

      // 4. Генерация отчета (без imageUrl)
      const reportData = {
        name: "report.fpx",
        folderId: rapairRootId, // ID папки для отчетов
      };

      const prepareResponse = await fetch(
        `https://hygieia.fast-report.com/api/rp/v1/Templates/File/${templateId}/Prepare`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`,
          },
          body: JSON.stringify(reportData),
        }
      );

      const repairFileData = await prepareResponse.json();

      const exportData = {
        fileName: "report.pdf",
        folderId: exportsRootId, // ID папки для отчетов
        format: "Pdf",
        locale: "ru-RU",
      };

      const exportResponse = await fetch(
        `https://hygieia.fast-report.com/api/rp/v1/Reports/File/${repairFileData.id}/Export`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`,
          },
          body: JSON.stringify(exportData),
        }
      );

      const dowloadExport = await fetch(
        `https://hygieia.fast-report.com/download/e/674bc9ea1d6ee7f62ddce45d`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      const exportFileData = await exportResponse.json();

      // Получаем blob из ответа
      const blob = await dowloadExport.blob();

      // Создаем URL объекта из blob
      const url = window.URL.createObjectURL(blob);

      // Создаем ссылку и инициируем загрузку
      const a = document.createElement("a");
      a.href = url;
      a.download = "report.pdf"; // Имя файла для скачивания
      document.body.appendChild(a); // Добавляем ссылку в DOM
      a.click(); // Симулируем клик по ссылке

      // Очищаем URL объекта (необязательно, но рекомендуется)
      window.URL.revokeObjectURL(url);

      console.log(dowloadExport);
      setLoading(false);
    } catch (error) {
      console.error("Подробности ошибки:", error);
      if (error instanceof Response) {
        // Проверяем, что ошибка - это Response
        error
          .json()
          .then((errorData) => {
            // Пытаемся получить JSON с ошибкой
            console.error("Данные ошибки от сервера:", errorData);
          })
          .catch((err) => {
            console.error("Ошибка при парсинге JSON ошибки:", err); // Если не удалось распарсить JSON
            console.error("Текст ответа сервера:", error.text()); // Выводим текст ответа
          });
      } else {
        console.error(error);
      }

      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <div>
        <input
          type="file"
          ref={inputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          onClick={handleButtonClick}
          className="px-4 py-2 text-xs bg-[#425255] text-white rounded-lg"
        >
          {image?.name ? "Изменить файл" : "Добавить изображение"}
        </Button>
      </div>

      {loading && <p>Uploading...</p>}

      <Button
        className="px-4 py-2 mx-auto text-xs bg-[#425255] text-white rounded-lg"
        onClick={() => {
          if (image) generateReportWithImage(image, templateFile);
        }}
        disabled={!image || loading}
      >
        Создать упаковку
      </Button>
    </div>
  );
};

export default TemplateImageUploader;
