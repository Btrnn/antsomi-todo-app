// Libraries
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

// Icons
import {} from "components/icons";

// Components
import { Drawer, Tabs, type TabsProps, message } from "components/ui";
import { CommentList } from "./Comments";
import { SubTasks } from "./SubTasks";
import { TaskDetail } from "./TaskDetail";

// Models
import { Task } from "models";

// Constants
import { MENU_KEY } from "constant";

// Hooks
import { useTaskList } from "hooks";

// Styled
import { DrawerContainer } from "./styled";

interface TaskDrawerProp {
  permission: string;
}

interface TState {
  task: Task | undefined;
  isDrawerOpen: boolean;
  activeKey: string;
}

export const TaskDrawer: React.FC<TaskDrawerProp> = (props) => {
  const { permission } = props;
  const [messageCreate, contextHolder] = message.useMessage();

  // States
  const [state, setState] = useState<TState>({
    task: undefined,
    isDrawerOpen: false,
    activeKey: MENU_KEY.KEY1,
  });

  const { task, isDrawerOpen, activeKey } = state;

  // Hooks
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { taskList, isLoading } = useTaskList(params.boardId || "");

  // Stores
  //const taskList = useSelector((state: RootState) => state.task.taskList);

  // Effects
  useEffect(() => {
    if (!isLoading) {
      const taskInfo = taskList.find(
        (task) => (task.id as string) === searchParams.get("taskId")
      );
      if (taskInfo) {
        setState((prev) => ({
          ...prev,
          task: taskInfo,
          isDrawerOpen: true,
          activeKey: MENU_KEY.KEY1,
        }));
      }
    }
    // const taskInfo = taskList.find(task => (task.id as string) === searchParams.get('taskId'));
    //   if (taskInfo) {
    //     setState(prev => ({ ...prev, task: taskInfo, isDrawerOpen: true }));
    //   }
  }, [searchParams, isLoading]);

  // Handlers
  const onClose = () => {
    setSearchParams({});
    setState((prev) => ({ ...prev, isDrawerOpen: false }));
  };

  const items: TabsProps["items"] = [
    {
      key: MENU_KEY.KEY1,
      label: "Overview",
      children: (
        <TaskDetail
          task={task}
          boardId={params.boardId ?? ""}
          permission={permission}
        />
      ),
    },
    {
      key: MENU_KEY.KEY2,
      label: "Subtasks",
      children: <SubTasks taskID={searchParams.get("taskId") ?? ""} />,
    },
    {
      key: MENU_KEY.KEY3,
      label: "Comments",
      children: <CommentList taskID={searchParams.get("taskId") ?? ""} />,
    },
  ];

  return (
    isDrawerOpen ? (
      <Drawer
        title={<div className="p-3">{task ? task.name : ""}</div>}
        placement="right"
        size={"large"}
        onClose={onClose}
        open={isDrawerOpen}
        footer={<></>}
        closeIcon={false}
        className="flex flex-col h-full"
      >
        <DrawerContainer>
          <Tabs
            className="flex flex-col w-full h-full"
            centered
            activeKey={activeKey}
            onChange={(key) =>
              setState((prev) => ({ ...prev, activeKey: key }))
            }
            items={items}
          />
        </DrawerContainer>
      </Drawer>
    ): null
  ) ;
};
