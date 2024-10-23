// Libraries
import { useSelector, useDispatch } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

// Stores
import { RootState } from 'store';

// Icons
import {} from 'components/icons';

// Components
import { Form, Drawer, Tabs, type TabsProps, message } from 'components/ui';
import { TaskDetail } from './TaskDetail';
import { SubTasks } from './SubTasks';
import { Comments } from './Comments';

// Models
import { Task } from 'models';

// Services
import { updateTask as updatedTaskAPI } from 'services/task';

// Constants
import { MENU_KEY } from 'constants/tasks';
import { useTaskList } from 'hooks/useTaskList';

interface TaskDrawerProp {
  permission: string;
}

interface TState {
  task: Task | undefined;
  isDrawerOpen: boolean;
}

export const TaskDrawer: React.FC<TaskDrawerProp> = props => {
  const { permission } = props;
  const [messageCreate, contextHolder] = message.useMessage();

  // States
  const [state, setState] = useState<TState>({
    task: undefined,
    isDrawerOpen: false,
  });

  const { task, isDrawerOpen } = state;

  // Hooks
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  //const { taskList, isLoading } = useTaskList(params.boardId || '');

  // Stores
  const taskList = useSelector((state: RootState) => state.task.taskList);

  // Effects
  useEffect(() => {
    // if (!isLoading) {
    //   const taskInfo = taskList.find(task => (task.id as string) === searchParams.get('taskId'));
    //   if (taskInfo) {
    //     setState(prev => ({ ...prev, task: taskInfo, isDrawerOpen: true }));
    //   }
    // }
    const taskInfo = taskList.find(task => (task.id as string) === searchParams.get('taskId'));
      if (taskInfo) {
        setState(prev => ({ ...prev, task: taskInfo, isDrawerOpen: true }));
      }
  }, [searchParams]);

  // Handlers
  const onClose = () => {
    setSearchParams({});
    setState(prev => ({ ...prev, isDrawerOpen: false }));
  };

  const items: TabsProps['items'] = [
    {
      key: MENU_KEY.KEY1,
      label: 'Overview',
      children: <TaskDetail task={task} onClose={onClose} permission={permission} />,
    },
    {
      key: MENU_KEY.KEY2,
      label: 'Subtasks',
      children: <SubTasks taskID={searchParams.get('taskId') || ''} />,
    },
    {
      key: MENU_KEY.KEY3,
      label: 'Comments',
      children: <Comments taskID={searchParams.get('taskId') || ''} />,
    },
  ];

  return (
    <Drawer
      title={<div className="p-3">{task ? task.name : ''}</div>}
      placement="right"
      size={'large'}
      onClose={onClose}
      open={isDrawerOpen}
      footer={<></>}
      closeIcon={false}
    >
      <Tabs defaultActiveKey={MENU_KEY.KEY1} items={items} />
    </Drawer>
  );
};
