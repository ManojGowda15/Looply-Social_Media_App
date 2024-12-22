import React from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

const Heart = ({ size = 24, color = theme.fonts.extrabold, ...props }) => {
  return <FontAwesome5 name="heart" size={size} color={color} {...props} />;
};

export default Heart;
