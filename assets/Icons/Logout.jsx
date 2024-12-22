import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

const Logout = () => {
  return <AntDesign name="logout" size={20} color={theme.colors.text} />;
};

export default Logout;
