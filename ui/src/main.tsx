import { StrictMode } from "react";
import { BrowserRouter, Route } from "react-router";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Routes } from "react-router";
import PdfEditorApp from "./PdfEditorApp.tsx";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <Routes>
        <Route path="" element={<App />} />
        <Route path="pdf-editor" element={<PdfEditorApp />} />
      </Routes>
    </StrictMode>
  </BrowserRouter>,
);
