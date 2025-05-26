import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Progress } from "./components/ui/progress";
import { Button } from "./components/ui/button";
import { Card, CardHeader } from "./components/ui/card";

type UploadedFile = {
  id: number;
  file: File;
};

function App() {
  const [isFileDragOver, setFileDragOver] = useState<boolean>(false);
  const [inputFiles, setInputFiles] = useState<UploadedFile[]>([]);
  const [draggingItem, setDraggingItem] = useState<null | number>(null);

  const [fileMergedCount, setFileMergedCount] = useState<null | number>(null);

  const addFiles = (files: File[]) => {
    setInputFiles((prev) => [
      ...prev,
      ...files.map<UploadedFile>((file, index) => ({
        id: prev.length + index,
        file: file,
      })),
    ]);
  };

  return (
    <div className="relative grid w-screen grid-cols-1 place-items-center">
      {fileMergedCount && (
        <div className="absolute top-0 left-0 z-10 flex h-screen w-full items-center justify-center bg-gray-50 p-4 opacity-70">
          <Progress value={(fileMergedCount / inputFiles.length) * 100} />
        </div>
      )}

      <div className="flex w-full flex-col content-stretch items-center gap-4 p-4">
        <h1 className="text-bold text-4xl">Chỉnh sửa file PDF</h1>

        <div>
          <Button
            disabled={inputFiles.length === 0}
            onClick={async () => {
              setFileMergedCount(0);

              const mergedPdf = await PDFDocument.create();
              for (const uploadedFile of inputFiles) {
                const pdf = await PDFDocument.load(
                  await uploadedFile.file.arrayBuffer(),
                );
                const copiedPages = await mergedPdf.copyPages(
                  pdf,
                  pdf.getPageIndices(),
                );
                copiedPages.forEach((page) => {
                  mergedPdf.addPage(page);
                });
                setFileMergedCount((prev) => (prev ?? 0) + 1);
              }

              const data = new Blob([await mergedPdf.save()], {
                type: "application/pdf",
              });
              const csvURL = window.URL.createObjectURL(data);
              const tempLink = document.createElement("a");
              tempLink.href = csvURL;
              tempLink.setAttribute("download", "test.pdf");
              tempLink.click();
              setFileMergedCount(null);
            }}
          >
            Gộp file
          </Button>
        </div>

        <div
          className={`rounded-sm p-0.5 ${isFileDragOver ? "cursor-pointer border-dashed bg-gray-50" : "border-1"} flex w-full items-center justify-center`}
          onDragOver={(event) => {
            event.preventDefault();
            setFileDragOver(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setFileDragOver(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setFileDragOver(false);
            addFiles(Array.from(event.dataTransfer.files));
          }}
        >
          {inputFiles.length === 0 ? (
            <EmptyFileEditor addFiles={addFiles} />
          ) : (
            <div className="grid w-full grid-cols-5 gap-2 p-2">
              {inputFiles.map((uploadedFile, index) => (
                <Card
                  key={uploadedFile.id}
                  id={uploadedFile.id.toString()}
                  className={`h-48 cursor-move break-all`}
                  draggable
                  onDragStart={() => {
                    setDraggingItem(index);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDraggingItem(null);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    const target = e.target as HTMLDivElement;
                    const targetIndex = inputFiles.findIndex(
                      (f) => f.id.toString() === target.id[0],
                    );

                    if (draggingItem !== null && draggingItem !== targetIndex) {
                      const temp = inputFiles[draggingItem];
                      inputFiles[draggingItem] = inputFiles[targetIndex];
                      inputFiles[targetIndex] = temp;
                      setInputFiles(inputFiles);
                      setDraggingItem(targetIndex);
                    }
                  }}
                >
                  <CardHeader>{uploadedFile.file.name}</CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const EmptyFileEditor = (props: { addFiles: (files: File[]) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      className="flex h-36 w-full cursor-pointer items-center justify-center text-center hover:bg-gray-50"
      onClick={() => {
        fileInputRef.current?.click();
      }}
    >
      Drop your files here
      <input
        type="file"
        id="file"
        accept="application/pdf"
        multiple
        ref={fileInputRef}
        onChange={() => {
          props.addFiles(Array.from(fileInputRef.current?.files ?? []));
        }}
        className="hidden"
      />
    </div>
  );
};

export default App;
