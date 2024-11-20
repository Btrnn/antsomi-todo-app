import { Comment } from 'models';
import { useEffect, useState } from 'react';
import { socket } from 'services';
import { IdentifyId } from 'types';

// Components
import { Button, Input, List } from 'components/ui';
import { CommentItem } from '../CommentItem';

interface CommentThreadProp {
  allComments: Comment[];
  threadID: React.Key;
  taskID: IdentifyId;
}

type TState = {
  commentList: Comment[];
  newComment: string;
};

const users = [
  { id: '1', name: 'A', email: 'a@gmail.com' },
  { id: '2', name: 'B', email: 'b@gmail.com' },
  { id: '3', name: 'C', email: 'c@gmail.com' },
];

export const CommentThread: React.FC<CommentThreadProp> = props => {
  const { taskID, threadID, allComments } = props;

  const [state, setState] = useState<TState>({
    commentList: [],
    newComment: '',
  });

  const { commentList, newComment } = state;

  // Effects
  // useEffect(() => {
  //   setState((prev) => ({
  //     ...prev,
  //     commentList: allComments.filter(
  //       (comment) => comment.threadId === threadID
  //     ),
  //   }));
  // }, [allComments]);

  // Handlers

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

  return <div></div>;
  // (

  // <List
  //   dataSource={commentList.filter((comment) => comment.parentId === null)}
  //   renderItem={(item) => (
  //     <CommentItem
  //       taskID={taskID}
  //       comment={item}
  //       replies={commentList.filter(
  //         (comment) => comment.parentId === item.id
  //       )}
  //       allThreadComment={commentList}
  //     />
  //     // <List.Item>
  //     //   <List.Item.Meta
  //     //     avatar={<UserIcon />}
  //     //     title={getUserName(item.user_id)}
  //     //     description={
  //     //       <div>
  //     //         {item.content}
  //     //         <ReplyIcon />
  //     //       </div>
  //     //     }
  //     //   />
  //     //   <div className="text-xs">
  //     //     {item.created_at
  //     //       ? formatDistanceToNow(new Date(item.created_at), {
  //     //           addSuffix: true,
  //     //         })
  //     //       : ""}
  //     //   </div>
  //     // </List.Item>
  //   )}
  // />
  //);
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
