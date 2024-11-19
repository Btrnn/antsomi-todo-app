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
import { UserIcon, ReplyIcon, SendIcon } from 'components/icons';
import { Button, Input, List } from 'components/ui';

interface CommentItemProp {
  taskID: React.Key;
  comment: Comment;
  replies: Comment[];
  allThreadComment: Comment[];
}

type TState = {
  commentList: Comment[];
  newComment: string;
  isReplying: boolean;
};

const users = [
  { id: '1', name: 'A', email: 'a@gmail.com' },
  { id: '2', name: 'B', email: 'b@gmail.com' },
  { id: '3', name: 'C', email: 'c@gmail.com' },
];

export const CommentItem: React.FC<CommentItemProp> = props => {
  const { taskID, comment, replies, allThreadComment } = props;
  const [state, setState] = useState<TState>({
    commentList: [],
    newComment: '',
    isReplying: false,
  });

  const { commentList, newComment, isReplying } = state;

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
      threadId: comment.threadId,
    });

    setState(prev => ({
      ...prev,
      newComment: '',
      isReplying: false,
    }));
  };

  const onClickStartReply = () => {
    setState(prev => ({
      ...prev,
      isReplying: !prev.isReplying,
    }));
  };

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
    <List.Item>
      <List.Item.Meta
        avatar={<UserIcon />}
        className="mb-2"
        title={
          <div className="flex w-full justify-between">
            <span className="font-semibold">{getUserName(comment.user_id)}</span>
            <div className="text-xs">
              {comment.created_at
                ? formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                  })
                : ''}
            </div>
          </div>
        }
        description={
          <div>
            <div className="flex w-full justify-between">
              {comment.content}
              <ReplyIcon onClick={onClickStartReply} />
            </div>
            {isReplying && (
              <div className="mt-2 flex">
                <Input
                  value={newComment}
                  onChange={e =>
                    setState(prev => ({
                      ...prev,
                      newComment: e.target.value,
                    }))
                  }
                  className="w-full"
                  placeholder="Write a reply..."
                />
                <Button
                  icon={<SendIcon />}
                  type="primary"
                  onClick={onClickAddReply}
                  style={{ marginTop: '8px' }}
                />
              </div>
            )}
            <div className="ml-4">
              {replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  replies={allThreadComment.filter(comment => comment.parentId === reply.id)}
                  taskID={taskID}
                  allThreadComment={allThreadComment}
                />
              ))}
            </div>
          </div>
        }
      />
    </List.Item>
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
