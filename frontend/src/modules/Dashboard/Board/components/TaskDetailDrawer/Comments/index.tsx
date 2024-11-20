// Libraries
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { formatDistanceToNow } from "date-fns";

// Components
import { CloseIcon, DownIcon, RepliedIcon, SendIcon, UserIcon } from "components/icons";
import {
  Button,
  Input,
  List,
  MenuProps,
  Tree,
  TreeDataNode,
  TreeProps,
} from "components/ui";
import { CommentItem } from "./components/CommentItem";

// Services
import { socket } from "services";

// Types
import { IdentifyId } from "types";

// Models
import { Comment } from "models";

// Styled
import { CommentWrapper } from "./styled";

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
    created_at: "2024-11-19T08:30:00Z",
    updated_at: "2024-11-19T08:30:00Z",
  },
];

// type MenuItem = Required<TreeDataNode>["items"][number];

type TState = {
  commentList: Comment[];
  newComment: string;
  treeList: TreeDataNode[];
  isReplying: boolean;
  replyDescription: string;
  repliedComment: React.Key | null;
};

export const CommentList: React.FC<CommentProp> = (props) => {
  const { taskID } = props;
  const [response, setResponse] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");

  // States
  const [state, setState] = useState<TState>({
    commentList: comments,
    newComment: "",
    treeList: [],
    isReplying: false,
    replyDescription: "",
    repliedComment: null,
  });

  const { commentList, newComment, treeList, isReplying, replyDescription, repliedComment } =
    state;

  // Handlers
  const buildTree = (comments: Comment[], parentId: React.Key | null) => {
    if (comments.length === 0) {
      return;
    }
    return comments
      .filter((comment) => comment.parentId === parentId)
      .map((comment) => ({
        ...comment,
        key: comment.id,
        title: (
          <CommentItem
            taskID={taskID}
            comment={comment}
            onReply={(id) => {
              onClickStartReply(id);
            }}
          />
        ),
        children: buildTree(comments, comment.id),
      }));
  };

  // Effects
  useEffect(() => {
    socket.on("comment-received", (data: any) => {
      const newId = Math.random();
      const newCommentObj: Comment = {
        id: newId,
        object_id: taskID,
        user_id: Math.floor(Math.random() * 3) + 1,
        object_type: "task",
        content: data.content,
        parentId: data.parentId,
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
      treeList: buildTree(commentList, null),
    }));
  }, [commentList]);

  // Handlers
  const onClickStartReply = (commentID: React.Key) => {
    const comment = commentList.find((comment) => comment.id === commentID);
    setState((prev) => ({
      ...prev,
      isReplying: true,
      replyDescription: `Replying to: ${comment?.content}`,
      repliedComment: commentID,
    }));
  };

  const onClickAddComment = () => {
    if (newComment.trim() === "") {
      return;
    }

    const socket: Socket = io("http://localhost:4000");
    socket.emit("comment-sent", {
      content: newComment,
      parentId: repliedComment,
    });

    setState((prev) => ({
      ...prev,
      newComment: "",
      isReplying: false,
      replyDescription: "",
      repliedComment: null,
    }));

    
  };

  return (
    <CommentWrapper className="flex flex-col h-full w-full justify-between flex-1">
      <div className="overflow-auto w-full">
        <Tree
          //showLine
          treeData={treeList}
          switcherIcon={<DownIcon />}
          selectedKeys={[repliedComment || '']}
          //expandedKeys={[]}
        />
      </div>
      <div className="w-full mt-2">
          {isReplying && (
              <div className="w-full flex text-xs text-gray-500 p-1 gap-1 mb-1">
                <RepliedIcon />
                {replyDescription}
                <CloseIcon className="cursor-pointer mr-10 hover:text-red-700" onClick={() => setState((prev) => ({ ...prev, isReplying: false, replyDescription: "", repliedComment: null }))}/>
              </div>
          )}
          <div className="w-full gap-x-1 flex">
            <Input
              className="p-2"
              style={{
                outline: "none",
                boxShadow: "none",
              }}
              placeholder="Add new comment"
              value={newComment}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  newComment: e.target.value,
                }))
              }
              onPressEnter={onClickAddComment}
            />
            <Button
              className="w-10 h-10"
              onClick={onClickAddComment}
              type="primary"
            >
              <SendIcon />
            </Button>
          </div>
      </div>
    </CommentWrapper>
  );
};
