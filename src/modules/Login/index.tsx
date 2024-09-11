// Libraries
import React from 'react';

interface LoginProps {
}

export const Login: React.FC<LoginProps> = props => {
  const { ...restProps } = props;

  return <div>Login</div>;
};
