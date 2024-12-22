import React from "react";
import { EvilIcons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

const Lock = () => {
  return <EvilIcons name="lock" size={30} color={theme.colors.textLight} />;
};

export default Lock;
