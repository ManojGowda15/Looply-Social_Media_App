// imageService.js
import { decode } from "base64-arraybuffer";
import { supabase } from "./../lib/supabase";
import * as FileSystem from "expo-file-system";
import { supabaseUrl } from "../constants";
import * as Sharing from "expo-sharing";

export const getUserImageSrc = (imagePath) => {
  if (imagePath) {
    return getSupabaseFileUrl(imagePath);
  } else {
    return require("../assets/images/defaultUser1.png");
  }
};

export const getSupabaseFileUrl = (filePath) => {
  if (filePath) {
    return {
      uri: `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`,
    };
  }
  return null;
};

export const downloadFile = async (url) => {
  try {
    if (!url) {
      console.log("Download error: No URL provided");
      return null;
    }

    // Generate a unique filename to avoid conflicts
    const timestamp = new Date().getTime();
    const extension = url.split(".").pop(); // Get file extension from URL
    const filename = `file_${timestamp}.${extension}`;
    const localPath = `${FileSystem.documentDirectory}${filename}`;

    console.log("Downloading from:", url);
    console.log("Saving to:", localPath);

    const downloadResult = await FileSystem.downloadAsync(url, localPath);
    console.log("Download result:", downloadResult);

    if (downloadResult.status !== 200) {
      console.log("Download failed with status:", downloadResult.status);
      return null;
    }

    console.log("Download successful:", downloadResult.uri);
    return downloadResult.uri;
  } catch (error) {
    console.error("Download error:", error);
    return null;
  }
};

export const getLocalFilePath = (filePath) => {
  let fileName = filePath.split("/").pop();
  let localPath = `${FileSystem.documentDirectory}${fileName}`;
  console.log("Generated local path:", localPath);
  return localPath;
};

export const uploadFile = async (folderName, fileUri, isImage = true) => {
  try {
    console.log("Starting file upload:", { folderName, fileUri, isImage });

    let fileName = getFilePath(folderName, isImage);
    console.log("Generated file path:", fileName);

    const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    let imageData = decode(fileBase64);

    let { data, error } = await supabase.storage
      .from("uploads")
      .upload(fileName, imageData, {
        cacheControl: "3600",
        upsert: false,
        contentType: isImage ? "image/*" : "video/*",
      });

    if (error) {
      console.log("File upload error:", error);
      return { success: false, msg: "Could not upload media" };
    }

    console.log("Upload successful:", data.path);
    return { success: true, data: data.path };
  } catch (error) {
    console.error("File upload error:", error);
    return { success: false, msg: "Could not upload media" };
  }
};

export const getFilePath = (folderName, isImage) => {
  return `/${folderName}/${new Date().getTime()}${isImage ? ".png" : ".mp4"}`;
};
