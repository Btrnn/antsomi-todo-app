// Libraries
import React from 'react';

// Constants
import { globalToken, REGEX } from 'constant';

// Components
import { Tooltip } from 'components/ui';

export const formatMentions = (text: string) => {
  return text.split(REGEX.MENTION).map((part, index) => {
    if (index % 3 === 1) {
      const name = part;
      const id = text.split(REGEX.MENTION)[index + 1];

      return (
        <Tooltip key={id} title={name}>
          <span
            style={{ color: globalToken.colorPrimary }}
            className="font-bold cursor-pointer bg-blue-200 px-[6px] rounded-md"
          >
            @{name}
          </span>
        </Tooltip>
      );
    }

    if (index % 3 === 2) {
      return '';
    }

    return part;
  });
};
