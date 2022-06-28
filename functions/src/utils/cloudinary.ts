import * as functions from "firebase-functions";

import * as cloudinary from "cloudinary";
import * as streamifier from "streamifier";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";

cloudinary.v2.config({
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  cloud_name: CLOUDINARY_CLOUD_NAME,
});

export const upload = async ({
  path,
  buffer,
}: {
  path: string;
  buffer: Buffer;
}): Promise<any> => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.v2.uploader.upload_stream(
      {
        public_id: path,
      },
      (error: any, result: any) => {
        if (result) {
          resolve(result);
        } else {
          functions.logger.error(
            `Error occurred while uploading the image to cloudinary: ${{
              error,
              path,
            }}`,
            { structuredData: true }
          );
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const deleteFile = async (path: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.destroy(path, (error: any, result: any) => {
      if (result) {
        resolve(result);
      } else {
        functions.logger.error(
          `Error occurred while deleting the file from cloudinary: ${{
            error,
            path,
          }}`,
          { structuredData: true }
        );
        reject(error);
      }
    });
  });
};

export const deleteFolder = async (path: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.api.delete_folder(path, (error: any, result: any) => {
      if (result) {
        resolve(result);
      } else {
        functions.logger.error(
          `Error occurred while deleting folder in cloudinary : ${{
            error,
            path,
          }}`,
          { structuredData: true }
        );
        reject(error);
      }
    });
  });
};
