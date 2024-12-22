import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

const Video = () => {
  return (
    <Ionicons name="videocam-outline" size={30} color={theme.colors.textDark} />
  );
};

export default Video;
