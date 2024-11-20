import React from 'react';

export const ReplyIcon: React.FC = () => {
  return (
    <svg
      className="w-4 h-4 hover:fill-sky-900 hover:brightness-200"
      xmlns="http://www.w3.org/2000/svg"
      height="10px"
      viewBox="0 -960 960 960"
      width="10px"
      fill="#434343"
    >
      <path d="M744-210v-144q0-50-35-85t-85-35H282l123 123-51 51-210-210 210-210 51 51-123 123h342q80 0 136 56t56 136v144h-72Z" />
    </svg>
  );
};

export const RepliedIcon: React.FC = () => {
  return (
    <svg
      className="w-4 h-4"
      xmlns="http://www.w3.org/2000/svg"
      height="10px"
      viewBox="0 -960 960 960"
      width="10px"
      fill="#434343"
    >
      <path d="m600-200-56-57 143-143H300q-75 0-127.5-52.5T120-580q0-75 52.5-127.5T300-760h20v80h-20q-42 0-71 29t-29 71q0 42 29 71t71 29h387L544-624l56-56 240 240-240 240Z" />
    </svg>
  );
};
