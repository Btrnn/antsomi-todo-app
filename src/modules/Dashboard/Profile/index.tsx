// Libraries
import React from 'react';

interface ProfileProps {}

export const Profile: React.FC<ProfileProps> = props => {
  const { ...restProps } = props;

  return <div>Profile</div>;
};
