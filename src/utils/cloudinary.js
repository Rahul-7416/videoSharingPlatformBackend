import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new Error('Local file path is required for upload');
        }

        console.log(`Attempting to upload file: ${localFilePath}`);

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // Ensure the response contains expected properties
        if (!response || !response.url) {
            throw new Error('Invalid response from Cloudinary');
        }

        console.log(`File uploaded successfully: ${response.url}`);

        console.log(response);

        // Optionally remove the local file after uploading
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log(`Local file deleted: ${localFilePath}`);
        }

        return response;

    } catch (error) {
        console.error(`Error uploading file to Cloudinary: ${error.message}`, error);

        // Optionally remove the local file if upload failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log(`Local file deleted after failed upload: ${localFilePath}`);
        }

        throw new Error('Cloudinary upload failed');
    }
};

const deleteFromCloudinary = async (file_public_id) => {
    try {
        const response = await cloudinary.uploader.destroy(
            `${file_public_id}`,
            {
                resource_type: 'image'
            }
        )
        console.log(response);
    } catch (error) {
        console.log(`Error occured while deleteing the img file`);
        console.log(error);
    }
}

export { uploadOnCloudinary, deleteFromCloudinary };
