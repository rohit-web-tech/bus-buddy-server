import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv" ;
dotenv.config({})
// cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

export default async function uploadOnCloudinary(imageUrl) {
    // Upload an image
    const uploadResult = await cloudinary.uploader.upload(imageUrl).catch((error) => { console.log(error) })
    return uploadResult ;
}