import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload file on cloudinary
    const responce = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // delete local file after upload
    fs.unlinkSync(localFilePath);

    // console.log("File uploaded successfully:", responce.url);

    return responce;
  } catch (error) {
    console.log("CLOUDINARY FULL ERROR => ");
    console.log(error);

    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

export { uploadOnCloudinary };
