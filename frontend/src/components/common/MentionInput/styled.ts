import styled from 'styled-components';

export const MentionInputWrapper = styled.div`
  width: 100%;
  height: 100% !important;
  border: none;
  outline: none;
  box-shadow: none;

  textarea {
    border: none;
    outline: none;
    box-shadow: none;
    resize: none;
    overflow: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  &:focus-within {
    border: none;
    outline: none;
    box-shadow: none;
  }
`;
