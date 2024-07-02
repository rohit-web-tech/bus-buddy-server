import multer from "multer";
import crypto from "crypto";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        // Generate a random unique filename
        crypto.randomBytes(16, (err, raw) => {
          if (err) return cb(err);
          // Generate the filename with the original extension
          const uniqueFileName = raw.toString('hex') + path.extname(file.originalname);
        cb(null, uniqueFileName)
        });
    }
})

export const upload = multer({
    storage
});