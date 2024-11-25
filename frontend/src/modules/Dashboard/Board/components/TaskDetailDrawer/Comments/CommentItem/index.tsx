// Libraries
import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// Models
import { Comment } from 'models';

// Services
import { createSocket } from 'services';

// Types
import { IdentifyId } from 'types';

// Components
import { ReplyIcon, MoreIcon, DeleteIcon, EditIcon } from 'components/icons';
import { Dropdown, Input, MenuInfo, MenuProps, Modal } from 'components/ui';

// Constants
import { MENU_KEY, OBJECT_TYPE, ROLE_KEY, SOCKET_CHANEL, SOCKET_NAMESPACE } from 'constant';

dayjs.extend(utc);
dayjs.extend(timezone);

interface CommentItemProp {
  taskID: React.Key;
  comment: Comment;
  permission: string;
  userList: {
    id: string;
    name: string;
    email: string;
    permission: string;
  }[];
  userID: IdentifyId;
  onReply: (id: React.Key) => void;
}

type TState = {
  commentList: Comment[];
  newComment: string;
  isReplying: boolean;
  isOpen: boolean;
  isEdited: boolean;
  editedContent: string | undefined;
};

export const CommentItem: React.FC<CommentItemProp> = props => {
  const { taskID, comment, onReply, permission, userList, userID } = props;
  const [state, setState] = useState<TState>({
    commentList: [],
    newComment: '',
    isReplying: false,
    isOpen: false,
    isEdited: false,
    editedContent: undefined,
  });
  const { isOpen, isEdited, editedContent } = state;

  // Services
  const socket = createSocket(SOCKET_NAMESPACE.COMMENT, taskID, OBJECT_TYPE.TASK);

  // Effects

  // Handlers
  const getUserName = (userId: React.Key): string => {
    const user = userList.find(u => u.id === String(userId));
    return user ? user.name : 'Unknown User';
  };

  const onClickAction = (event: MenuInfo) => {
    setState(prev => ({
      ...prev,
      isOpen: false,
    }));
    if (event.key === MENU_KEY.KEY2) {
      onClickBeginEditing();
    }
  };

  const onClickChangeOpen = () => {
    // if (checkAuthority(permission, PERMISSION[ROLE_KEY.EDITOR])) {
    if (!isOpen) {
      setState(prev => ({
        ...prev,
        isOpen: true,
      }));
    } else {
      setState(prev => ({
        ...prev,
        isOpen: false,
      }));
    }
    // }
  };

  const onClickShowDropDown = () => {
    // if (checkAuthority(permission, PERMISSION[ROLE_KEY.EDITOR])) {
    if (!isOpen) {
      setState(prev => ({
        ...prev,
        isOpen: true,
      }));
    } else {
      setState(prev => ({
        ...prev,
        isOpen: false,
      }));
    }
    // }
  };

  const onClickDeleteComment = () => {
    socket.emit(SOCKET_CHANEL.DELETE_COMMENT, { id: comment.id });
  };

  const onClickBeginEditing = () => {
    setState(prev => ({
      ...prev,
      isEdited: true,
      editedContent: comment.content,
    }));
  };

  const onChangeContent = (event: React.ChangeEvent<HTMLInputElement> | undefined) => {
    setState(prev => ({ ...prev, editedContent: event?.target.value }));
  };

  const onClickEditComment = () => {
    socket.emit(SOCKET_CHANEL.EDIT_COMMENT, {
      id: comment.id,
      content: editedContent,
      updated_at: new Date(),
    });
    setState(prev => ({
      ...prev,
      isEdited: false,
      editedContent: '',
    }));
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <div className="flex p-2">
          <EditIcon className="mr-3" />
          <div>Edit</div>
        </div>
      ),
      key: MENU_KEY.KEY2,
    },
    {
      label: (
        <div
          className="flex p-2 text-red-500"
          onClick={() => {
            // if (checkAuthority(permission, PERMISSION[ROLE_KEY.EDITOR])) {
            Modal.confirm({
              title: 'Are you sure you want to delete this comment?',
              content: (
                <div className="text-gray-700 text-xs">
                  Deleting this comment will remove all its replies.
                </div>
              ),
              footer: (_, { OkBtn, CancelBtn }) => (
                <>
                  <CancelBtn />
                  <OkBtn />
                </>
              ),
              onOk: onClickDeleteComment,
            });
            // }
          }}
        >
          <DeleteIcon className="mr-3" />
          <div>Delete</div>
        </div>
      ),
      key: MENU_KEY.KEY1,
    },
  ];

  //   useEffect(() => {
  //     socket.on("comment-received", (data: string) => {
  //       const newId = comments.length + 1;
  //       const newCommentObj: Comment = {
  //         id: newId,
  //         object_id: taskID,
  //         user_id: Math.floor(Math.random() * 3) + 1,
  //         object_type: "task",
  //         content: data,
  //         parentId: null,
  //         threadId: newId,
  //         created_at: new Date().toISOString(),
  //         updated_at: new Date().toISOString(),
  //       };
  //       setState((prev) => ({
  //         ...prev,
  //         commentList: [...prev.commentList, newCommentObj],
  //       }));
  //     });

  //     return () => {
  //       socket.off("comment-received");
  //     };
  //   }, []);

  // const sendMessage = () => {
  //   const socket: Socket = io('http://localhost:4000');
  //   // const commentData: Omit<Comment, 'id' | 'created_at' | 'user_id'> = {
  //   //   object_id: taskID,

  //   // };
  //   socket.emit('comment', message);
  //   setMessage('');
  // };

  // Handlers
  //   const handleAddComment = () => {
  //     if (newComment.trim() === "") {
  //       return;
  //     }

  //     const socket: Socket = io("http://localhost:4000");
  //     socket.emit("comment-sent", newComment);

  //     setState((prev) => ({
  //       ...prev,
  //       newComment: "",
  //     }));
  //   };

  //   const getUserName = (userId: React.Key): string => {
  //     const user = users.find((u) => u.id === String(userId));
  //     return user ? user.name : "Unknown User";
  //   };

  return (
    <div className="w-full mb-2 p-[6px]">
      <div className="flex w-full justify-between items-center">
        <span className="font-semibold">{getUserName(comment.user_id)}</span>
        <div className="text-xs text-gray-500">
          {comment.created_at
            ? formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: false,
                includeSeconds: true,
                // locale: vi,
              })
            : ''}
        </div>
      </div>
      <div className="mt-2">
        <div className="flex w-full justify-between items-center">
          {isEdited ? (
            <Input
              className="w-full h-full p-0"
              style={{
                boxShadow: 'none',
                borderColor: 'transparent',
                backgroundColor: 'transparent',
              }}
              autoFocus={true}
              value={editedContent}
              onChange={onChangeContent}
              onPressEnter={onClickEditComment}
              onBlur={() => {
                setState(prev => ({
                  ...prev,
                  isEdited: false,
                  editID: '',
                  editedContent: '',
                }));
              }}
            />
          ) : (
            <span>{comment.content}</span>
          )}

          <div className="flex gap-1">
            <button onClick={() => onReply(comment.id)}>
              <ReplyIcon />
            </button>
            {permission === ROLE_KEY.OWNER || userID === comment.user_id ? (
              <Dropdown
                key={comment.id}
                menu={{
                  items,
                  onClick: event => onClickAction(event),
                }}
                placement="bottomLeft"
                open={isOpen}
                trigger={['click']}
                onOpenChange={onClickChangeOpen}
              >
                <MoreIcon
                  className="hover:text-sky-900 hover:brightness-200"
                  onClick={onClickShowDropDown}
                />
              </Dropdown>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
  // <div className="flex flex-col h-full w-full">
  //   <div className="flex-1 overflow-auto p-2">
  //     <List
  //       dataSource={commentList}
  //       renderItem={(item) => (
  //         <List.Item>
  //           <List.Item.Meta
  //             avatar={<UserIcon />}
  //             title={getUserName(item.user_id)}
  //             description={
  //               <div>
  //                 {item.content}
  //                 <ReplyIcon />
  //               </div>
  //             }
  //           />
  //           <div className="text-xs">{item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }): ''}</div>
  //         </List.Item>
  //       )}
  //     />
  //   </div>
  //   <div style={{ marginTop: "16px" }}>
  //     <Input.TextArea
  //       rows={4}
  //       value={newComment}
  //       onChange={(e) =>
  //         setState((prev) => ({
  //           ...prev,
  //           newComment: e.target.value,
  //         }))
  //       }
  //       placeholder="Write a comment..."
  //     />
  //     <Button
  //       type="primary"
  //       onClick={handleAddComment}
  //       style={{ marginTop: "8px" }}
  //     >
  //       Add Comment
  //     </Button>
  //   </div>
  //   {/* <div>
  //     <h3>Comments:</h3>
  //     <div>
  //       {response.map((msg, index) => (
  //         <li key={index}>{msg}</li>
  //       ))}
  //     </div>
  //   </div>
  //   <div>
  //     <input
  //       type="text"
  //       value={message}
  //       onChange={e => setMessage(e.target.value)}
  //       placeholder="Type a message"
  //     />
  //     <button onClick={sendMessage}>Send Message</button>
  //   </div> */}
  // </div>
  //   );
};
