import React from "react";
import { theme } from "../../constants/theme";
import { FontAwesome } from "@expo/vector-icons";

const Plus = () => {
  return (
    <FontAwesome name="plus-square-o" size={27} color={theme.fonts.extrabold} />
  );
};

export default Plus;
