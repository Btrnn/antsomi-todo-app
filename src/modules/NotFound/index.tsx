// Libraries
import React from 'react';

interface NotFoundProps {}

export const NotFound: React.FC<NotFoundProps> = props => {
  const { ...restProps } = props;

  return <div>NotFound</div>;
};
