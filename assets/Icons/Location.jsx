import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

const Location = () => {
  return (
    <Ionicons
      name="location-outline"
      size={24}
      color={theme.colors.textLight}
    />
  );
};

export default Location;
