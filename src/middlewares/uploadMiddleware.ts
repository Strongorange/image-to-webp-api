import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "../uploads/");
  },
  filename: (req, file, callback) => {
    const timestamp = Date.now();
    const originalName = path.parse(file.originalname).name;
    const extension = path.extname(file.originalname);
    callback(null, `${originalName}-${timestamp}${extension}`);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error("JPEG, PNG, GIF, WebP 확장자만 허용됩니다."));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export const uploadImages = upload.array("images", 10); // 최대 10개 이미지 허용
