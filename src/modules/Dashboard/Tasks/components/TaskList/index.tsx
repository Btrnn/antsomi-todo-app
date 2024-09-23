// Libraries
import { useDispatch } from "react-redux";
import React, { useState } from "react";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";


// Store
import { AppDispatch, addTask } from "store";

// Icons
import {
  AddIcon,
} from "components/icons";

// Components
import {
  Button,
  Input,
} from "components/ui";

// Models
import { Task } from "models";
import { Group } from "models/Group";

//
import { TaskItem } from "../TaskItem";
import { TaskDetail } from "../TaskDetailDrawer";

interface TaskList {
  groupInfo: Group;
  taskList: Task[];
}

export const TaskList: React.FC<TaskList> = (props) => {
  // State
  const { groupInfo, taskList } = props;
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [state, setState] = useState({
    inputTask: "",
    error: "",
    isOpen: false,
  });
  const { inputTask } = state || {};

  // Store
  const dispatch: AppDispatch = useDispatch();

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

  const onCloseTaskDetail = () => {
    setState((prev) => ({ ...prev, isOpen: false }));
    setSelectedTask(undefined);
  };

  const onChangeInputTask = (event: any) => {
    setState((prev) => ({ ...prev, inputTask: event.target.value }));
  };
  
  const renderTasks = (tasks: Task[]) => {
    const filteredTasks = tasks.filter(
      (task) => task.status_id === groupInfo.id
    );

    return (
      <>
        {filteredTasks.map((task, index) => (
            <TaskItem
              key={task.id}
              groupID={groupInfo.id}
              task={task}
              onClickShowDetail={() => onClickShowTaskDetail(task.id)}
            />
        ))}
      </>
    );
  };

  return (
    <div>
      <SortableContext
        key={groupInfo.id}
        id={String(groupInfo.id)}
        items={taskList
          .filter((task) => task.status_id === groupInfo.id)
          .map((task) => String(task.id))}
        strategy={verticalListSortingStrategy}
      >
        <div key={groupInfo.id} className="items-center overflow-hidden">
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
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            isOpened={state.isOpen}
            isClosed={onCloseTaskDetail}
          />
        )}
      </SortableContext>
    </div>
  );
};
