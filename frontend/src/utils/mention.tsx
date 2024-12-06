// Libraries
import React from 'react';

// Constants
import { globalToken, REGEX } from 'constant';

// Components
import { Tag, Tooltip } from 'components/ui';

export const formatMentions = (text: string) => {
  return text.split(REGEX.MENTION).map((part, index) => {
    if (index % 3 === 1) {
      const name = part;
      const id = text.split(REGEX.MENTION)[index + 1];

      return (
        <Tooltip key={id} title={name}>
          <Tag
            bordered={false}
            className="justify-center font-bold"
            style={{ color: globalToken.colorPrimary }}
            color="blue"
          >
            @{name}
          </Tag>
        </Tooltip>
      );
    }

    if (index % 3 === 2) {
      return '';
    }

    return part;
  });
};
