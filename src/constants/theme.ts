// Libraries
import { ThemeConfig, theme } from "antd";

export const THEME: ThemeConfig = {
  token: {
    colorPrimary: "#005fb8",
    colorInfo: "#005fb8",
    borderRadius: 10,
  },
};

export const globalToken = theme.getDesignToken(THEME);
