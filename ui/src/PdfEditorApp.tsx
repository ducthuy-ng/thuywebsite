import { CSS } from "@dnd-kit/utilities";
import { PDFDocument } from "pdf-lib";
import { useRef, useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardTitle } from "./components/ui/card";
import { Progress } from "./components/ui/progress";
import { Icon } from "@iconify/react";

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
        <div
          className={`absolute top-0 left-0 flex h-screen w-full grid-rows-2 flex-col items-center justify-center gap-4 bg-gray-50 p-4 transition duration-200 ${fileMergedCount === null ? "-z-1 opacity-0" : "z-999 opacity-70"}`}
        >
          <div>Đang xử lý file, bạn đợi xíu nhé!</div>
          <Progress
            value={((fileMergedCount || 0) / inputFiles.length) * 100}
          />
        </div>
        <div className="grid h-screen w-full grid-rows-[5%_5%_65%] gap-4 p-4">
          <h1 className="text-bold flex items-center justify-center text-4xl">
            Chỉnh sửa file PDF
          </h1>
          <div className="flex items-center justify-center">
            <Button
              className="transition-300 cursor-pointer hover:shadow-lg"
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
          {inputFiles.length === 0 ? (
            <EmptyFileEditor addFiles={addFiles} />
          ) : (
            <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
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
              <AddFileButton addFiles={addFiles} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const EmptyFileEditor = (props: { addFiles: (files: File[]) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      props.addFiles(files);
    }
  };

  return (
    <div
      className={`grid h-36 w-full cursor-pointer place-items-center-safe rounded-md border text-center duration-300 hover:bg-gray-50 ${isDragOver ? "bg-gray-100" : "bg-white"}`}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragOver(false);
      }}
      onDrop={handleFileDrop}
    >
      Thả file bạn muốn tổng hợp tại đây nè
      <input
        type="file"
        id="file"
        accept="application/pdf"
        multiple
        ref={fileInputRef}
        onChange={() =>
          props.addFiles(Array.from(fileInputRef.current?.files ?? []))
        }
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
      className={`z-10 h-full cursor-move break-all hover:bg-gray-50 hover:shadow-lg ${isDragging ? "shadow-2xl" : ""}`}
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

const AddFileButton = (props: { addFiles: (files: File[]) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <Card
      className="cursor-pointer p-0 duration-300 hover:bg-gray-50 hover:shadow-lg"
      onClick={() => fileInputRef.current?.click()}
    >
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
      <div className="m-2 flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300">
        <div>Thêm một số file khác</div>
        <Icon icon="ep:circle-plus" style={{ fontSize: "3rem" }} />
      </div>
    </Card>
  );
};
