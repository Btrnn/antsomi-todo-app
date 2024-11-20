// Libraries
import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { io, Socket } from 'socket.io-client';

// Models
import { Comment } from 'models';

// Services
import { socket } from 'services';

// Types
import { IdentifyId } from 'types';

// Components
import { UserIcon, ReplyIcon, SendIcon, MoreIcon, DeleteIcon, EditIcon } from 'components/icons';
import { Button, Dropdown, Input, List, MenuInfo, MenuProps, Modal } from 'components/ui';

// Constants
import { MENU_KEY } from 'constants/tasks';

interface CommentItemProp {
  taskID: React.Key;
  comment: Comment;
  onReply: (id: React.Key) => void;
}

type TState = {
  commentList: Comment[];
  newComment: string;
  isReplying: boolean;
  isOpen: boolean;
};

const users = [
  { id: '1', name: 'A', email: 'a@gmail.com' },
  { id: '2', name: 'B', email: 'b@gmail.com' },
  { id: '3', name: 'C', email: 'c@gmail.com' },
];

export const CommentItem: React.FC<CommentItemProp> = props => {
  const { taskID, comment, onReply } = props;
  const [state, setState] = useState<TState>({
    commentList: [],
    newComment: '',
    isReplying: false,
    isOpen: false,
  });

  const { commentList, newComment, isReplying, isOpen } = state;

  // Effects
  //   useEffect(() => {
  //     setState(prev => ({
  //       ...prev,
  //       commentList: allThreadComment,
  //     }));
  //   }, [allThreadComment]);

  // Handlers
  const getUserName = (userId: React.Key): string => {
    const user = users.find(u => u.id === String(userId));
    return user ? user.name : 'Unknown User';
  };

  const onClickAddReply = () => {
    if (newComment.trim() === '') {
      return;
    }

    const socket: Socket = io('http://localhost:4000');
    socket.emit('comment-sent', {
      content: newComment,
      parentId: comment.id,
    });

    setState(prev => ({
      ...prev,
      newComment: '',
      isReplying: false,
    }));
  };

  const onClickAction = (event: MenuInfo, commentID: React.Key) => {
    if (event.key === MENU_KEY.KEY2) {
      //onClickBeginRenaming(groupID, groupName);
    }
    setState(prev => ({
      ...prev,
      isOpen: false,
    }));
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
                <div className="text-red-500 text-xs">
                  Deleting this comment will remove all its replies.
                </div>
              ),
              footer: (_, { OkBtn, CancelBtn }) => (
                <>
                  <CancelBtn />
                  <OkBtn />
                </>
              ),
              onOk: () => {},
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
                addSuffix: true,
              })
            : ''}
        </div>
      </div>
      <div className="mt-2">
        <div className="flex w-full justify-between items-center">
          <span>{comment.content}</span>
          <div className="flex gap-1">
            <button onClick={() => onReply(comment.id)}>
              <ReplyIcon />
            </button>
            <Dropdown
              key={comment.id}
              menu={{
                items,
                onClick: event => onClickAction(event, comment.id),
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
