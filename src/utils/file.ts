export const getFileType = (uri: string): string => {
  if (uri.endsWith(".jpg") || uri.endsWith(".jpeg")) return "image/jpeg";
  if (uri.endsWith(".png")) return "image/png";
  if (uri.endsWith(".webp")) return "image/webp";
  if (uri.endsWith(".gif")) return "image/gif";
  if (uri.endsWith(".bmp")) return "image/bmp";
  if (uri.endsWith(".tiff") || uri.endsWith(".tif")) return "image/tiff";
  if (uri.endsWith(".svg")) return "image/svg+xml";
  if (uri.endsWith(".mp4")) return "video/mp4";
  if (uri.endsWith(".avi")) return "video/x-msvideo";
  if (uri.endsWith(".mov")) return "video/quicktime";
  if (uri.endsWith(".pdf")) return "application/pdf";
  if (uri.endsWith(".doc")) return "application/msword";
  if (uri.endsWith(".docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (uri.endsWith(".xls")) return "application/vnd.ms-excel";
  if (uri.endsWith(".xlsx"))
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  return "application/octet-stream"; // fallback
};