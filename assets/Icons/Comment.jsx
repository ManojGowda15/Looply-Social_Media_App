import React from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

const Comment = () => {
  return (
    <FontAwesome5 name="comment" size={20} color={theme.colors.textLight} />
  );
};

export default Comment;
