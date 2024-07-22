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

        // The case where we don't want to delete our img file -> as it needs to be there everytime for the testing purpose
        const typeOfDir = localFilePath.split('/');
        console.log(typeOfDir);
        if (typeOfDir[2] === "test") {
            return response;
        }

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

const deleteFromCloudinary = async (file_public_id) => {  // file_public_id -> chaiAurBackend/thumnail_asmglm
    try {
        const requiredKeywordArray = file_public_id.split("/"); // requiredKeywordArray will be an array -> ["chaiAurBackend", "thumnail_asmglm"]
        const resource_type = requiredKeywordArray[0] ===  "chaiAurBackendVideo" ? 'video' : 'image';

        console.log(`Attempting to delete a ${resource_type} file`);
        const response = await cloudinary.uploader.destroy(
            `${file_public_id}`,
            {
                resource_type: resource_type
            }
        )
        console.log(response);
    } catch (error) {
        console.log(`Error occured while deleteing the img file`);
        console.log(error);
    }
}

const healthCheckCloudinary = async () => {
    try {
        // NOTE: Always give path from the point of view that you are in the root directory and do not use the relative path from the directory, same for the multer middleware
        // e.g.: './public/test/testImageForCloudinary.png' -> correct path, as it is from the pov of root directory
        // but: '../../public/test/testImageForCloudinary.png' -> incorrect path, as it is relative to the current file

        // const testFilePath = await path.resolve(__dirname, './public/test');
        const testFilePath = './public/test/testImageForCloudinary.png';
        console.log(testFilePath);
        if (!fs.existsSync(testFilePath)) {
            throw new Error(`Test file does not exist: ${testFilePath}`);
        }

        const uploadResponse = await uploadOnCloudinary(testFilePath);
        console.log(uploadResponse);
        await deleteFromCloudinary(uploadResponse.public_id);
        return true;
    } catch (error) {
        console.error('Cloudinary health check failed:', error);
        return false;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary, healthCheckCloudinary };
