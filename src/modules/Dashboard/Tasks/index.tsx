// Libraries
import { AddIcon } from "components/icons";
import { Button } from "components/ui";
import { TASK_STATUS, TASK_STATUS_KEY } from "../../../constants";
import React, { useState } from "react";

interface TasksProps {}

interface TaskItemProps {
  id: number;
  name: string;
  index: number;
  status: any;

  // callback
  onClick: (task: any) => void;
}

export const Tasks: React.FC<TasksProps> = (props) => {
  const { ...restProps } = props;

  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Task 1",
      status: TASK_STATUS_KEY.TODO,
    },
    {
      id: 2,
      name: "Task 2",
      status: TASK_STATUS_KEY.DOING,
    },
    {
      id: 3,
      name: "Task 3",
      status: TASK_STATUS_KEY.DONE,
    },
  ]);
  const [clickedTask, setClickedTask] = useState<any>(undefined);

  const renderTasks = () => {
    return tasks
      ?.filter((task) => task.status === TASK_STATUS_KEY.DOING)
      .map((task, index) => {
        return (
          <TaskItem
            key={index}
            {...task}
            index={index}
            onClick={(task) => {
              setClickedTask(task.name);
            }}
          />
        );
      });
  };

  const onClickReversTasks = () => {
    setTasks([...tasks.reverse()]);
  };

  return (
    <div className="flex items-center gap-2.5">
      {renderTasks()}

      <Button type="primary" shape="round" onClick={onClickReversTasks}>
        <AddIcon fill="#fff" />
        Reverse tasks
      </Button>

      {clickedTask ? `Task is Clicked: ${clickedTask}` : `No task is clicked`}
    </div>
  );
};

export const TaskItem: React.FC<TaskItemProps> = (props) => {
  const { id, name = "Default name", index, status, onClick } = props;

  return (
    <div
      key={id}
      className={`flex flex-col gap-5 shadow-md p-3 rounded hover:bg-slate-300`}
      style={{
        backgroundColor: (TASK_STATUS as any)[status]?.color,
      }}
      onClick={() => onClick({ id, name, hello: "world" })}
    >
      <div className={``}>
        {`${index + 1}.`} {name}
      </div>
    </div>
  );
};
