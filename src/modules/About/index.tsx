// Libraries
import React from "react";

interface AboutProps {}

export const About: React.FC<AboutProps> = (props) => {
  const { ...restProps } = props;

  return <div>About</div>;
};
