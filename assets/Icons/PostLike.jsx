import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "./../../constants/theme";
import { liked } from "../../components/PostCard";

const PostLike = ({ liked = true }) => {
  return (
    <MaterialCommunityIcons
      name={liked ? "heart" : "heart-outline"}
      size={24}
      color={liked ? theme.colors.rose : theme.colors.textLight}
    />
  );
};

export default PostLike;
