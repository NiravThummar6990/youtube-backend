import {v2 as cloudinary} from "cloudinary";
import fs from "fs"
      
    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });
    
   const uploadOnClodinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        // upload the file on cloudinary

        const responce = await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"})

        // / file had been uploaded successfully

        console.log("file has beeen successfuly in clodinary filepath os  : " ,responce.url);
        
        return responce

    } catch (error) {

            fs.unlink(localFilePath)  // remove the locally saved temporory file as the upload operation got failed

            return null
    }
   }