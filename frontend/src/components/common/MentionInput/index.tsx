// Libraries
import React, { useEffect, useRef, useState } from 'react';
import { MentionsInput, Mention, OnChangeHandlerFunc } from 'react-mentions';

// Styled
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
  isEdit: boolean;
  onEnter: () => void;
  //onBlur: () => void;
}

type TState = {
  newComment: string;
};

const MentionInput: React.FC<MentionInputProp> = props => {
  const { editedContent, onChangeContent, userList, isEdit, onEnter } = props;
  const currentCommentRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<TState>({
    newComment: editedContent,
  });
  const { newComment } = state;

  const onChangeComment = (e: { target: { value: string } }) => {
    if (e.target.value !== '\n') {
      onChangeContent(e.target.value);
      setState(prev => ({
        ...prev,
        newComment: e.target.value,
      }));
    }
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
    <MentionInputWrapper
      ref={currentCommentRef}
      // /className="overflow-x-auto"
      style={
        !isEdit
          ? {
              border: '1px solid var(--ant-color-border)',
              borderRadius: 'var(--ant-border-radius)',
              padding: '0.5rem',
            }
          : {}
      }
      onKeyDown={e => {
        if (e.key === 'Enter') {
          onEnter();
          setState(prev => ({
            ...prev,
            newComment: '',
          }));
        }
      }}
    >
      <MentionsInput
        className="w-full"
        value={newComment}
        onChange={onChangeComment}
        placeholder="Write your comment here..."
        //onBlur={onBlur}
      >
        <Mention
          trigger="@"
          data={userList.map(user => ({
            id: user.id,
            display: user.name,
          }))}
          // className="text-blue-400 px-2 font-bold"
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
