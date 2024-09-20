// Libraries
import { useSelector, useDispatch } from "react-redux";
import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import {
  DndContext,
  useDroppable,
  useDraggable,
  UniqueIdentifier,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
} from "@dnd-kit/core";
import {
  useSortable,
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Store
import { RootState, AppDispatch, addTask, deleteTaskByID } from "store";

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
import { transitionProperty } from "@dnd-kit/sortable/dist/hooks/defaults";
import { group } from "console";

interface TaskList {
  groupInfo: Group;
  activeTask: React.Key | null;
}

export const TaskList: React.FC<TaskList> = (props) => {
  // State
  const { activeTask, groupInfo } = props;
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [state, setState] = useState({
    inputTask: "",
    error: "",
    isOpen: false,
  });
  const { inputTask } = state || {};

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: String(groupInfo.id),
      data: { containerId: undefined },
    });

  // Store
  const dispatch: AppDispatch = useDispatch();
  const taskList = useSelector((state: RootState) => state.task.taskList);



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

    if (filteredTasks.length === 0) {
      return (
        <TaskItem
          groupID={groupInfo.id}
          task={undefined}
          onClickShowDetail={() => {}}
          isActive={false}
        />
      );
    }
    return (
      <>
        {filteredTasks.map((task, index) => (
            <TaskItem
              key={task.id}
              groupID={groupInfo.id}
              task={task}
              onClickShowDetail={() => onClickShowTaskDetail(task.id)}
              isActive={activeTask === task.id}
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
