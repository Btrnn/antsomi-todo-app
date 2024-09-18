// Libraries
import { useSelector, useDispatch } from "react-redux";
import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";

// Store
import {
  RootState,
  AppDispatch,
  addTask,
  deleteTaskByID,
} from "store";

// Icons
import {
  AddIcon,
  DeleteIcon,
  DoneIcon,
  FilterIcon,
  DragIcon,
  EditIcon,
} from "components/icons";

// Components
import {
  Button,
  Input,
  Popconfirm,
  notification,
  Dropdown,
  type MenuProps,
} from "components/ui";

// Models
import { Task } from "models";
import { Group } from "models/Group";

//
import { TaskItem } from "../TaskItem";
import { TaskDetail } from "../TaskDetailDrawer";

interface TaskList {
  groupInfo: Group;
}

export const TaskList: React.FC<TaskList> = (props) => {
  // State
  const { groupInfo } = props;
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [state, setState] = useState({
    inputTask: "",
    error: "",
    isOpen: false,
  });
  const { inputTask } = state || {};


  // Store
  const dispatch: AppDispatch = useDispatch();
  const taskList = useSelector((state: RootState) => state.task.taskList);

  // Variables
  let confirmDelete = false;

  // Handlers
  const onClickAddTask = () => {
    if (inputTask.length === 0)
      setState((prev) => ({
        ...prev,
        error: "This field is required",
        inputTask: "",
      }));
    else if (inputTask.length > 255) {
      setState((prev) => ({
        ...prev,
        error: "Name is too long, max length is 255 characters",
        inputTask: "",
      }));
    } else if (taskList.some((task) => task.name === inputTask)) {
      setState((prev) => ({ ...prev, error: "Task already exists!" }));
    } else {
      const newTask = {
        name: inputTask,
        description: "",
        est_time: "",
        start_date: new Date(),
        end_date: new Date(),
        assignee_id: undefined,
        status_id: groupInfo.id,
      };
      dispatch(addTask(newTask));

      setState((prev) => ({ ...prev, inputTask: "", error: "" }));
    }
  };

  const onClickShowTaskDetail = (taskID: React.Key) => {
    setState((prev) => ({ ...prev, isOpen: true }));
    setSelectedTask(taskList.find((task) => task.id === taskID));
  };

  const handleDeleteTask = (id: React.Key) => {
    dispatch(deleteTaskByID({id}));
  };

  const onConfirmDelete = () => {
    confirmDelete = true;
  };

  const onCloseTaskDetail = () => {
    setState((prev) => ({ ...prev, isOpen: false }));
    setSelectedTask(undefined);
  };

  const onClickAction = (event: any, taskID: any) => {
    if (event.key == 2)
      onClickShowTaskDetail(taskID);
    else if (event.key == 1 && confirmDelete)
      handleDeleteTask(taskID);
  };

  const onChangeInputTask = (event: any) => {
    setState((prev) => ({ ...prev, inputTask: event.target.value }));
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
          <div className="flex p-2">Delete task</div>
        </Popconfirm>
      ),
      key: "1",
    },
    {
      label: <div className="flex p-2">Edit task</div>,
      key: "2",
    },
  ];


  const renderTasks = (tasks: Task[]) => {
    return taskList?.filter((task) => task.status_id === groupInfo.id).length >
      0 ? (
      tasks
        .filter((task) => task.status_id === groupInfo.id)
        .map((task, index) => (
          <Draggable key={task.id} draggableId={String(task.id)} index={index}>
            {(taskProvided) => (
              <div
                className="items-center overflow-hidden mt-5"
                ref={taskProvided.innerRef}
                {...taskProvided.draggableProps}
                {...taskProvided.dragHandleProps}
              >
                <Dropdown
                  menu={{
                    items,
                    onClick: (event) => onClickAction(event, task.id),
                  }}
                  trigger={["contextMenu"]}
                >
                  <div>
                    <TaskItem
                      index={index}
                      task={task}
                      onClickShowDetail={() => onClickShowTaskDetail(task.id)}
                    />
                  </div>
                </Dropdown>
              </div>
            )}
          </Draggable>
        ))
    ) : (
      <></>
    );
  };

  return (
    <>
      <div className="flex-auto h-screen w-full">
        <div className="items-center overflow-hidden">
          {renderTasks(taskList)}
        </div>
        <div className="flex gap-1 mt-5">
          <Input
            className="p-2"
            placeholder="Add new task"
            value={inputTask}
            onChange={onChangeInputTask}
            onPressEnter={onClickAddTask}
          />
          <Button className="w-9 h-9" onClick={onClickAddTask}>
            <AddIcon />
          </Button>
        </div>
        <div className="text-red-400">{state.error}</div>
      </div>
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          isOpened={state.isOpen}
          isClosed={onCloseTaskDetail}
        />
      )}
    </>
  );
};
