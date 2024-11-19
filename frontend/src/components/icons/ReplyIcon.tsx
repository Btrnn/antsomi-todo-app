import React from 'react';
import replyIcon from '../../assets/svgs/reply_icon.svg';

export const ReplyIcon: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{ background: 'transparent', border: 'none', padding: '0', cursor: 'pointer' }}
    >
      <img src={replyIcon} alt="Reply" style={{ width: '16px', height: '16px' }} />
    </button>
  );
};
