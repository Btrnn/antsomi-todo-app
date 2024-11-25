// Libraries
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

// Components
import {
  CloseIcon,
  DownIcon,
  RepliedIcon,
  SendIcon,
  UserIcon,
} from "components/icons";
import { Button, Input, Tree, TreeDataNode } from "components/ui";
import { CommentItem } from "./CommentItem";

// Services
import { createSocket, getAllComments } from "services";

// Types
import { IdentifyId } from "types";

// Models
import { Comment } from "models";

// Styled
import { CommentWrapper } from "./styled";

// Constants
import { OBJECT_TYPE, SOCKET_CHANEL, SOCKET_NAMESPACE } from "constant";

// Hooks
import { useAccessList, useLoggedUser, usePermission } from "hooks";

interface CommentListProp {
  taskID: IdentifyId;
}

type TState = {
  commentList: Comment[];
  newComment: string;
  treeList: TreeDataNode[];
  isReplying: boolean;
  replyDescription: string;
  repliedComment: React.Key | null;
};

export const CommentList: React.FC<CommentListProp> = (props) => {
  const { taskID } = props;
  const params = useParams();

  // States
  const [state, setState] = useState<TState>({
    commentList: [],
    newComment: "",
    treeList: [],
    isReplying: false,
    replyDescription: "",
    repliedComment: null,
  });
  const {
    commentList,
    newComment,
    treeList,
    isReplying,
    replyDescription,
    repliedComment,
  } = state;

  // Hooks
  const { permission: boardPermission } = usePermission(
    params?.boardId ?? "",
    OBJECT_TYPE.BOARD
  );
  const { accessList } = useAccessList(
    params?.boardId ?? "",
    OBJECT_TYPE.BOARD
  );
  const { user } = useLoggedUser();

  // Refs
  const sendInputRef = useRef<any>(null);

  // Services
  const socket = createSocket(
    SOCKET_NAMESPACE.COMMENT,
    taskID,
    OBJECT_TYPE.TASK
  );

  // Handlers
  const buildTree = (comments: Comment[], parentId: React.Key | null) => {
    if (comments.length === 0) {
      return [];
    }
    return comments
      .filter((comment) => comment.parent_id === parentId)
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
            permission={boardPermission}
            userList={accessList}
            userID={user?.id ?? ""}
          />
        ),
        children: buildTree(comments, comment.id),
      }));
  };

  const getCommentList = async () => {
    const commentList = await getAllComments(params?.boardId ?? "", taskID);
    setState((prev) => ({
      ...prev,
      commentList: commentList.data,
    }));
  };

  // Effects
  useEffect(() => {
    getCommentList();
    socket.on(SOCKET_CHANEL.COMMENT_CREATED, (data: any) => {
      setState((prev) => ({
        ...prev,
        commentList: [...prev.commentList, data],
      }));
    });

    socket.on(SOCKET_CHANEL.COMMENT_EDITED, (data: any) => {
      setState((prev) => ({
        ...prev,
        commentList: prev.commentList.map((comment) =>
          comment.id === data.id ? { ...comment, ...data } : comment
        ),
      }));
    });

    socket.on(SOCKET_CHANEL.COMMENT_DELETED, (data: IdentifyId) => {
      setState((prev) => ({
        ...prev,
        commentList: prev.commentList.filter((comment) => comment.id !== data),
      }));
    });

    return () => {
      socket.off(SOCKET_CHANEL.COMMENT_CREATED);
      socket.off(SOCKET_CHANEL.COMMENT_DELETED);
      socket.off(SOCKET_CHANEL.COMMENT_EDITED);
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

      sendInputRef.current?.focus();
  };

  const onClickAddComment = () => {
    if (!newComment.trim()) {
      return;
    }

    socket.emit(SOCKET_CHANEL.CREATE_COMMENT, {
      content: newComment,
      parent_id: repliedComment,
      updated_at: null,
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
          motion={false}
          treeData={treeList}
          switcherIcon={<DownIcon />}
          selectedKeys={[repliedComment || ""]}
          //expandedKeys={[]}
        />
      </div>
      <div className="w-full mt-2">
        {isReplying && (
          <div className="w-full flex text-xs text-gray-500 p-1 gap-1 mb-1">
            <RepliedIcon />
            {replyDescription}
            <CloseIcon
              className="cursor-pointer mr-10 hover:text-red-700"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  isReplying: false,
                  replyDescription: "",
                  repliedComment: null,
                }))
              }
            />
          </div>
        )}
        <div className="w-full gap-x-1 flex">
          <Input
            ref={sendInputRef}
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
