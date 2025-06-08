import { CSS } from "@dnd-kit/utilities";
import { PDFDocument } from "pdf-lib";
import { useRef, useState } from "react";
import { pdfjs } from "react-pdf";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardTitle } from "./components/ui/card";
import { Progress } from "./components/ui/progress";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type UploadedFileId = number;
type UploadedFile = {
  id: UploadedFileId;
  file: File;
};

export default function PdfEditorApp() {
  const [inputFiles, setInputFiles] = useState<UploadedFile[]>([]);
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (typeof active.id !== "number") {
      console.error("Active id is not a number");
      return;
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over === null) {
      throw new Error("Over is null");
      return;
    }
    if (typeof active.id !== "number" || typeof over.id !== "number") {
      throw new Error("Active or over id is not a number");
      return;
    }

    if (active.id !== over.id) {
      setInputFiles((items) => {
        const idArray = items.map((file) => file.id);
        if (typeof active.id !== "number" || typeof over.id !== "number") {
          throw new Error("Active or over id is not a number");
        }
        const oldIndex = idArray.indexOf(active.id);
        const newIndex = idArray.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <>
      <title>PDF Editor</title>
      <div className="relative grid w-screen grid-cols-1 place-items-center">
        {fileMergedCount !== null && (
          <div className="transition-300 absolute top-0 left-0 z-10 flex h-screen w-full items-center justify-center bg-gray-50 p-4 opacity-70">
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
          {inputFiles.length === 0 && <EmptyFileEditor addFiles={addFiles} />}
          <div className="grid w-full grid-cols-3 gap-2 p-2 md:grid-cols-4 xl:grid-cols-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={inputFiles}
                strategy={rectSortingStrategy}
              >
                {inputFiles.map((uploadedFile) => (
                  <FileCard key={uploadedFile.id} file={uploadedFile} />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    </>
  );
}

const EmptyFileEditor = (props: { addFiles: (files: File[]) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      className="flex h-36 w-full cursor-pointer items-center justify-center rounded-md border text-center duration-300 hover:bg-gray-50"
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

const FileCard = (props: { file: UploadedFile }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : undefined,
  };

  return (
    <Card
      ref={setNodeRef}
      key={props.file.id}
      id={props.file.id.toString()}
      className={`z-10 h-48 cursor-move break-all ${isDragging ? "shadow-2xl" : ""}`}
      style={style}
      {...attributes}
      {...listeners}
    >
      <CardContent className="flex h-full w-full items-center justify-center">
        <div className="flex h-full w-full items-center justify-center">
          {props.file.file.name}
        </div>
      </CardContent>
      <CardTitle className="p-2">{props.file.file.name}</CardTitle>
    </Card>
  );
};
