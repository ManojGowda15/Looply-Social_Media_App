import { Feather } from "@expo/vector-icons";
import React from "react";
import { theme } from "../../constants/theme";

const Search = () => {
  return <Feather name="search" size={24} color={theme.colors.textLight} />;
};

export default Search;
