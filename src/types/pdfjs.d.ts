declare module "pdfjs-dist/legacy/build/pdf" {
  export * from "pdfjs-dist/types/src/display/api";
}

declare module "pdfjs-dist/legacy/build/pdf.worker.min.js?url" {
  const src: string;
  export default src;
}
