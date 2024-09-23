// Libraries
import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

//Providers
import { RootState, AppDispatch, deleteTaskByID } from "store";

// Icons
import { DeleteIcon, DragIcon, EditIcon } from "components/icons";

// Components
import { Popconfirm, Tag, Dropdown, type MenuProps } from "components/ui";

// Models
import { Task } from "models";
import { SORTABLE_TYPE } from "constants/tasks";

interface TaskItemProp {
  groupID: React.Key;
  task: Task | undefined;
  onClickShowDetail: (taskIndex: React.Key) => void;
}

export const TaskItem: React.FC<TaskItemProp> = (props) => {
  const { groupID, task, onClickShowDetail } = props;

  // Drag&Drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(task?.id),
    data: { groupID: groupID, type: SORTABLE_TYPE.TASK },
  });

  // Store
  const userList = useSelector((state: RootState) => state.user.userList);
  const groupList = useSelector((state: RootState) => state.group.groupList);
  const dispatch: AppDispatch = useDispatch();

  // Variables
  let confirmDelete = false;

  const onClickAction = (event: any, taskID: any) => {
    if (event.key === "2") onClickShowDetail(taskID);
    else if (event.key === "1" && confirmDelete) handleDeleteTask(taskID);
  };

  const handleDeleteTask = (id: React.Key) => {
    dispatch(deleteTaskByID({ id }));
  };

  const onConfirmDelete = () => {
    confirmDelete = true;
  };

  const items: MenuProps["items"] = [
    {
      label: (
        <Popconfirm
          placement="topLeft"
          title={"Are you sure to delete this task?"}
          description={"Delete the task"}
          okText="Yes"
          cancelText="No"
          onConfirm={onConfirmDelete}
        >
          <div className="flex p-2">
            <DeleteIcon className="mr-3" />
            <div>Delete task</div>
          </div>
        </Popconfirm>
      ),
      key: "1",
    },
    {
      label: (
        <div className="flex p-2">
          <EditIcon className="mr-3" />
          <div>Edit task</div>
        </div>
      ),
      key: "2",
    },
  ];

  return (
    <div
      style={{
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }}
      ref={setNodeRef}
      {...attributes}
    >
      {task ? (
        <Dropdown
          key={task.id}
          menu={{
            items,
            onClick: (event) => onClickAction(event, task.id),
          }}
          trigger={["contextMenu"]}
        >
          <div
            style={{
              border: "1px solid #d9d9d9",
            }}
            className="flex justify-between p-4 rounded w-full overflow-hidden mb-3 mt-5"
            onClick={() => onClickShowDetail(task.id)}
            id={String(task.id)}
          >
            <div key={task.id}>
              <div key={task.id} className="overflow-hidden max-w-3/4">
                <div className="font-bold mb-2 whitespace-normal">
                  {task.name}
                </div>
                <div className="font-light whitespace-nowrap mb-2">
                  {task.description}
                </div>
              </div>
              <div className="flex flex-col gap-y-2">
                <Tag
                  bordered={false}
                  color={
                    groupList.find((group) => group.id === task.status_id)
                      ?.color
                  }
                  className="justify-center items-center"
                >
                  {groupList.find((group) => group.id === task.status_id)?.name}
                </Tag>
                {task.assignee_id !== undefined && (
                  <Tag bordered={false} className="justify-center">
                    {
                      userList.find((user) => user.id === task.assignee_id)
                        ?.name
                    }
                  </Tag>
                )}
              </div>
            </div>
            <div {...listeners}>
              <DragIcon />
            </div>
          </div>
        </Dropdown>
      ) : (
        <div ref={setNodeRef} className="w-full, h-full"></div>
      )}
    </div>
  );
};
