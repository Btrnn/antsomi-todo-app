// Libraries
import { ThemeConfig, theme } from 'antd';

export const THEME: ThemeConfig = {
  token: {
    colorPrimary: '#005fb8',
    colorInfo: '#005fb8',
    borderRadius: 10,
  },
  components: {
    Tag: {
      borderRadiusSM: 13,
    },
  },
  //"algorithm": theme.darkAlgorithm,
};

export const globalToken = theme.getDesignToken(THEME);
