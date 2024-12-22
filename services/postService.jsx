import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

export const createOrUpdatePost = async (post) => {
  try {
    //Upload Image
    if (post.file && typeof post.file == "object") {
      let isImage = post?.file?.type == "image";
      let folderName = isImage ? "postImages" : "postVideos";
      let fileResult = await uploadFile(folderName, post?.file?.uri, isImage);
      if (fileResult.success) post.file = fileResult.data;
      else {
        return fileResult;
      }
    }

    const { data, error } = await supabase
      .from("posts")
      .upsert(post)
      .select()
      .single();

    if (error) {
      console.log("Create post error: ", error);
      return { success: false, msg: "Could not create post! Try Again." };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("CreatePost error : ", error);
    return { success: false, msg: "Could not create post! Try Again." };
  }
};

export const fetchPosts = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        user: users (id, name, image)`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.log("fetchPosts: ", error);
      return { success: false, msg: "Could not fetch the post! Try Again." };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("fetchPosts error : ", error);
    return { success: false, msg: "Could not fetch the post! Try Again." };
  }
};
