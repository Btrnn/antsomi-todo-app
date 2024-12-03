import React, { Component, LegacyRef, RefObject, useEffect, useRef, useState } from 'react';
import { MentionsInput, Mention, MentionsInputProps } from 'react-mentions';
import { MentionInputWrapper } from './styled';

interface MentionInputProp {
  userList: {
    id: string;
    name: string;
    email: string;
    permission: string;
  }[];
  editedContent: string;
  onChangeContent: (newContent: string) => void;
  //onClickEditComment: () => void;
}

type TState = {
  newComment: string;
};

const MentionInput: React.FC<MentionInputProp> = props => {
  const { editedContent, onChangeContent, userList } = props;
  const currentCommentRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<TState>({
    newComment: editedContent,
  });
  const { newComment } = state;

  const onChangeMentions = (value: string) => {
    const currentMentions = value.match(/@\w+/g)?.map(m => m.slice(1)) || [];
    setState(prev => ({
      ...prev,
      newComment: value,
    }));
  };

  useEffect(() => {
    if (currentCommentRef.current) {
      const textarea = currentCommentRef.current.querySelector('textarea');
      if (textarea) {
        textarea.select();
      }
    }
  }, []);

  useEffect(() => {
    setState(prev => ({
      ...prev,
      newComment: editedContent,
    }));
  }, [editedContent]);

  return (
    <MentionInputWrapper ref={currentCommentRef}>
      <MentionsInput
        className="w-full"
        value={newComment}
        onChange={e => {
          onChangeContent(e.target.value);
          onChangeMentions(e.target.value);
        }}
        placeholder="Write your comment here..."
        // onBlur={ }
      >
        <Mention
          trigger="@"
          data={userList.map(user => ({
            id: user.id,
            display: user.name,
          }))}
          className="text-blue-400 px-2 font-bold"
          renderSuggestion={({ id, display }) => {
            return <div className="p-2">{display}</div>;
          }}
          // onAdd={}

        />
      </MentionsInput>
    </MentionInputWrapper>
  );
};

export default MentionInput;
