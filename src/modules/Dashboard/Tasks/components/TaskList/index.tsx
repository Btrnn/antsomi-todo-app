// Libraries
import { nanoid } from "nanoid";
import { useSelector, useDispatch } from 'react-redux';

// Providers
import { 
  RootState, 
  AppDispatch,
  addTask, 
  updateTask,
  reorderTask, 
  deleteTask } from '../../../../../providers/redux';


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
    Select,
    Popconfirm,
    notification,
    FlexProps,
    SegmentedProps,
    Flex,
    Modal,
    Form,
} from "components/ui";

// Libraries
import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

// Models
import { Task } from "../../../../../models";
import { Group } from "models/Group";
import { User } from "models/User";

// Utils
import { reorder } from "utils";

// 
import { TaskItem } from "../TaskItem";
import { Divider } from "antd";

interface TaskList {
    groupInfo: Group;
}

export const TaskList: React.FC<TaskList> = (props) => {
    // State
    const { groupInfo } = props;

    //const [tasks, setTasks] = useState<Task[]>([]);

    const [state, setState] = useState({
        inputTask: "",
        error: "",
        isEdit: false,
        edittedTaskIndex: 0,
    })

    // Store
    const dispatch: AppDispatch = useDispatch();
    const taskList = useSelector((state: RootState) => state.task.taskList);

    const onClickAddTask = () => {
        if (state.inputTask.length === 0)
            setState(prev => ({ ...prev, error: "This field is required", inputTask: "" }))
        else if (state.inputTask.length > 255) {
            setState(prev => ({ ...prev, error: "Name is too long, max length is 255 characters", inputTask: "" }))
        } else {
            const newTask = {
              name: state.inputTask,
              description: "This task is for doing something",
              estTime: "",
              startDate: new Date(),
              endDate: new Date(),
              assignee_id: -1,
              status_id: groupInfo.id,
            };
            dispatch(addTask(newTask));

            setState(prev => ({ ...prev, inputTask: "", error: "" }))
        }
    };

    const onClickDeleteTask = (index: number) => {
      dispatch(deleteTask(index));
    };



    const onChangeInputTask = (event: any) => {
        setState(prev => ({ ...prev, inputTask: event.target.value }))
    };

    const onDragEnd = (result: any) => {
        const { source, destination } = result;
        if (!destination || source.index === destination.index) return;
        dispatch(reorderTask({source: source.index, destination: destination.index}));
    };

    const renderTasks = (tasks: Task[]) => {
      return taskList?.filter((task) => task.status_id === groupInfo.id).length >
        0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(tasksProvided) => (
              <div ref={tasksProvided.innerRef} className="mt-10">
                {tasks
                  .filter((task) => task.status_id === groupInfo.id)
                  .map((task, index) => {
                    return (
                      <Draggable
                        key={task.id}
                        draggableId={String(task.id)}
                        index={index}
                      >
                        {(taskProvided) => (
                          <div
                            className="items-center gap-y-2 overflow-hidden"
                            ref={taskProvided.innerRef}
                            {...taskProvided.draggableProps}
                            {...taskProvided.dragHandleProps}
                          >
                            <TaskItem
                              index={index}
                              task={task}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                {tasksProvided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ):(<></>);
    };

    return (
        <div>
            <div className="flex-auto h-screen w-full">
                <div className="items-center mb-5 overflow-hidden">
                    {renderTasks(taskList)}
                </div>
                <div className="flex gap-1">
                    <Input
                        className="p-2"
                        placeholder="Add new task"
                        value={state.inputTask}
                        onChange={onChangeInputTask}
                    />
                    <Button className="w-9 h-9" onClick={onClickAddTask}>
                        <AddIcon />
                    </Button>
                </div>
                <div className="text-red-400">{state.error}</div>
            </div>
        </div>
    );
};
