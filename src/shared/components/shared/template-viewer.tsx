"use client";
import React from "react";
import { ReportPage } from "./report-page";

const TemplateViewer = ({
  file,
  selectedImage,
}: {
  file: any;
  selectedImage: File | null;
}) => {
  const [report, setReport] = React.useState<any | null>(null);

  React.useEffect(() => {
    const fetchTemplate = async () => {
      const data = file;
      if (data) {
        const pageObjects =
          data.Report?.ReportPage?.[0]?.DataBand?.[0]?.PictureObject || [];
        setReport(
          pageObjects.map((obj: any) => ({
            Name: obj.$.Name,
            Left: parseFloat(obj.$.Left),
            Top: parseFloat(obj.$.Top),
            Width: parseFloat(obj.$.Width),
            Height: parseFloat(obj.$.Height),
          }))
        );
      }
    };

    fetchTemplate();
  }, []);

  return (
    <div>
      {report ? (
        <div>
          <ReportPage objects={report} selectedImage={selectedImage} />
        </div>
      ) : (
        <p className="text-gray-700 text-lg">Loading template...</p>
      )}
    </div>
  );
};

export default TemplateViewer;
