// Libraries
import React from 'react';

interface SettingProps {}

export const Setting: React.FC<SettingProps> = props => {
  const { ...restProps } = props;

  return <div>Setting</div>;
};
