declare module "@aws-sdk/client-s3" {
  export class S3Client {
    constructor(config: any);
  }
  export class PutObjectCommand {
    constructor(params: any);
  }
}

declare module "@aws-sdk/s3-request-presigner" {
  export function getSignedUrl(client: any, command: any, options: any): Promise<string>;
}

declare module "canvas" {
  export function createCanvas(width: number, height: number): any;
  export function loadImage(source: any): Promise<any>;
}

declare module "pdfkit" {
  const PDFDocument: any;
  export default PDFDocument;
}

declare module "pdf-parse" {
  const parsePdf: any;
  export default parsePdf;
}
