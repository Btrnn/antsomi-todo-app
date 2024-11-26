// Libraries
import React from 'react';

// Constants
import { globalToken, REGEX } from 'constant';

// Components
import { Tooltip } from 'components/ui';

// Function to parse raw value and format it
export const formatMentions = (text: string) => {
  // Replace mentions with styled spans
  return text.split(REGEX.MENTION).map((part, index) => {
    // Match alternate parts as mention details
    if (index % 3 === 1) {
      const name = part;
      const id = text.split(REGEX.MENTION)[index + 1]; // Get ID from regex capture group

      return (
        <Tooltip key={id} title={name}>
          <span style={{ color: globalToken.colorPrimary }} className="font-bold cursor-pointer">
            {name}
          </span>
        </Tooltip>
      );
    }

    // Skip id part
    if (index % 3 === 2) {
      return '';
    }

    // Return regular text
    return part;
  });
};
