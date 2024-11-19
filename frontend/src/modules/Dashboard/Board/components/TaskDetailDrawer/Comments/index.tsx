// Libraries
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { formatDistanceToNow } from "date-fns";

// Components
import { SendIcon, UserIcon } from "components/icons";
import { Button, Input, List } from "components/ui";
import { CommentThread } from "./components/CommentThread";

// Services
import { socket } from "services";

// Types
import { IdentifyId } from "types";

// Models
import { Comment } from "models";

interface CommentProp {
  taskID: IdentifyId;
}

const comments = [
  {
    id: 1,
    object_id: 101,
    user_id: 1,
    object_type: "task",
    content: "COMMENT 1",
    parentId: null,
    threadId: 1,
    created_at: "2024-10-23 01:42:04.022",
    updated_at: "2024-11-19T08:00:00Z",
  },
  {
    id: 2,
    object_id: 101,
    user_id: 2,
    object_type: "task",
    content: "COMMENT 1.1",
    parentId: 1,
    threadId: 1,
    created_at: "2024-11-19T08:10:00Z",
    updated_at: "2024-11-19T08:10:00Z",
  },
  {
    id: 3,
    object_id: 102,
    user_id: 3,
    object_type: "task",
    content: "COMMENT 2",
    parentId: null,
    threadId: 3,
    created_at: "2024-11-19T09:00:00Z",
    updated_at: "2024-11-19T09:00:00Z",
  },
  {
    id: 4,
    object_id: 101,
    user_id: 4,
    object_type: "task",
    content: "COMMENT 1.2",
    parentId: 1,
    threadId: 1,
    created_at: "2024-11-19T08:20:00Z",
    updated_at: "2024-11-19T08:20:00Z",
  },
  {
    id: 5,
    object_id: 101,
    user_id: 5,
    object_type: "task",
    content: "COMMENT 1.1.1",
    parentId: 2,
    threadId: 1,
    created_at: "2024-11-19T08:30:00Z",
    updated_at: "2024-11-19T08:30:00Z",
  },
];

type TState = {
  commentList: Comment[];
  newComment: string;
  threadList: React.Key[];
};

export const CommentList: React.FC<CommentProp> = (props) => {
  const { taskID } = props;
  const [response, setResponse] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");

  const [state, setState] = useState<TState>({
    commentList: comments,
    newComment: "",
    threadList: comments
      .filter((comment) => comment.parentId === null)
      .map((comment) => comment.threadId),
  });

  const { commentList, newComment, threadList } = state;

  // Effects
  useEffect(() => {
    socket.on("comment-received", (data: any) => {
      console.log("🚀 ~ socket.on ~ data:", data)
      const newId = Math.random();
      const newCommentObj: Comment = {
        id: newId,
        object_id: taskID,
        user_id: Math.floor(Math.random() * 3) + 1,
        object_type: "task",
        content: data.content,
        parentId: data.parentId,
        threadId: data.threadId || newId ,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        commentList: [...prev.commentList, newCommentObj],
      }));
    });

    return () => {
      socket.off("comment-received");
    };
  }, []);

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      threadList: prev.commentList
        .filter((comment) => comment.parentId === null)
        .map((comment) => comment.threadId),
    }));
  }, [commentList]);

  // const sendMessage = () => {
  //   const socket: Socket = io('http://localhost:4000');
  //   // const commentData: Omit<Comment, 'id' | 'created_at' | 'user_id'> = {
  //   //   object_id: taskID,

  //   // };
  //   socket.emit('comment', message);
  //   setMessage('');
  // };

  // Handlers
  const onClickAddComment = () => {
    if (newComment.trim() === "") {
      return;
    }

    const socket: Socket = io("http://localhost:4000");
    socket.emit("comment-sent", {content: newComment, parentId: null, threadId: null});

    setState((prev) => ({
      ...prev,
      newComment: "",
    }));
  };

  return (
    <div className="flex flex-col h-full w-full justify-between">
      <div className="flex-1 overflow-auto">
        {threadList.map((thread) => (
          <CommentThread
            allComments={commentList}
            taskID={taskID}
            threadID={thread}
          />
        ))}
      </div>
      <div className="flex mt-2">
        <Input.TextArea
          rows={2}
          value={newComment}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              newComment: e.target.value,
            }))
          }
          placeholder="Write a comment..."

        />
          <Button
            icon={<SendIcon />}
            type="primary"
            onClick={onClickAddComment}
            style={{ marginTop: "8px" }}
          />
      </div>
    </div>
  );
};
