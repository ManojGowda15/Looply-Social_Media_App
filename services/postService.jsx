import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

// Create or Update Post
export const createOrUpdatePost = async (post) => {
  try {
    // Upload Image or Video
    if (post.file && typeof post.file === "object") {
      const isImage = post?.file?.type === "image";
      const folderName = isImage ? "postImages" : "postVideos";
      const fileResult = await uploadFile(folderName, post?.file?.uri, isImage);

      if (fileResult.success) {
        post.file = fileResult.data;
      } else {
        return { success: false, msg: "File upload failed. Try again." };
      }
    }

    const { data, error } = await supabase
      .from("posts")
      .upsert(post)
      .select()
      .single();

    if (error) {
      console.error("Create post error:", error);
      return { success: false, msg: "Could not create post! Try again." };
    }
    return { success: true, data };
  } catch (error) {
    console.error("CreatePost error:", error);
    return { success: false, msg: "Could not create post! Try again." };
  }
};

// Fetch Posts
export const fetchPosts = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        user:users (id, name, image),
        postLikes (*)
        `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("fetchPosts error:", error);
      return { success: false, msg: "Could not fetch posts! Try again." };
    }
    return { success: true, data };
  } catch (error) {
    console.error("fetchPosts error:", error);
    return { success: false, msg: "Could not fetch posts! Try again." };
  }
};

// Fetch Post Likes
export const fetchPostLikes = async (postId) => {
  try {
    const { data, error } = await supabase
      .from("postLikes")
      .select("*")
      .eq("postId", postId);

    if (error) {
      console.error("fetchPostLikes error:", error);
      return { success: false, msg: "Could not fetch post likes! Try again." };
    }
    return { success: true, data };
  } catch (error) {
    console.error("fetchPostLikes error:", error);
    return { success: false, msg: "Could not fetch post likes! Try again." };
  }
};

// Create Post Like
export const createPostLike = async (postLikes) => {
  try {
    const { data, error } = await supabase
      .from("postLikes")
      .insert(postLikes)
      .select()
      .single();

    if (error) {
      console.error("createPostLike error:", error);
      return { success: false, msg: "Unable to like the post! Try again." };
    }
    return { success: true, data };
  } catch (error) {
    console.error("createPostLike error:", error);
    return { success: false, msg: "Unable to like the post! Try again." };
  }
};

// Remove Post Like
export const removePostLike = async (postId, userId) => {
  try {
    const { error } = await supabase
      .from("postLikes")
      .delete()
      .eq("userId", userId)
      .eq("postId", postId);

    if (error) {
      console.error("removePostLike error:", error);
      return {
        success: false,
        msg: "Unable to remove the like! Try again.",
      };
    }
    return { success: true };
  } catch (error) {
    console.error("removePostLike error:", error);
    return {
      success: false,
      msg: "Unable to remove the like! Try again.",
    };
  }
};
