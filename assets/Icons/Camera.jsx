import React from "react";
import { EvilIcons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

const Camera = () => {
  return <EvilIcons name="camera" size={24} color={theme.colors.textLight} />;
};

export default Camera;
