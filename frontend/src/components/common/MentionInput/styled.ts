import styled from 'styled-components';

export const MentionInputWrapper = styled.div`
  width: 100%;
  height: 100% !important;
  border: none;
  outline: none;
  box-shadow: none;
  display: flex;

  textarea {
    width: 100%;
    border: none;
    outline: none;
    box-shadow: none;
    resize: none;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  &:focus-within {
    border: none;
    outline: none;
    box-shadow: none;
  }
`;
