import React, { SVGProps } from "react";

export const AddIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      {...props}
    >
      <path
        d="M18.9844 12.9844H12.9844V18.9844H11.0156V12.9844H5.01562V11.0156H11.0156V5.01562H12.9844V11.0156H18.9844V12.9844Z"
        fill="currentColor"
      />
    </svg>
  );
};
