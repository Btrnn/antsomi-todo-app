// Libraries
import React from 'react';
import { ConfigProvider } from 'antd';

// Constants
import { THEME } from '../constants';

interface AntdConfigProviderProps {}

export const AntdConfigProvider: React.FC<
  React.PropsWithChildren<AntdConfigProviderProps>
> = props => {
  const { children } = props;

  return <ConfigProvider theme={THEME}>{children}</ConfigProvider>;
};
