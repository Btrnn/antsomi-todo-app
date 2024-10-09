// Libraries
import { useSelector, useDispatch } from 'react-redux';
import React, { useEffect } from 'react';

//Providers
import { RootState } from 'store';

// Icons
import {} from 'components/icons';

// Components
import { Form, Drawer, Tabs, type TabsProps } from 'components/ui';
import { TaskDetail } from './TaskDetail';
import { SubTasks } from './SubTasks';
import { Comments } from './Comments';

// Models
import { Task } from 'models';

// Services
import { updateTask as updatedTaskAPI } from 'services/task';

// Constants
import { MENU_KEY } from 'constants/tasks';

interface TaskDrawerProp {
  task: Task;
  isOpen: boolean;
  isClose: () => void;
}

export const TaskDrawer: React.FC<TaskDrawerProp> = props => {
  const { task, isOpen, isClose } = props;

  const items: TabsProps['items'] = [
    {
      key: MENU_KEY.KEY1,
      label: 'Overview',
      children: <TaskDetail task={task} onClose={isClose} />,
    },
    {
      key: MENU_KEY.KEY2,
      label: 'Subtasks',
      children: <SubTasks task={task} />,
    },
    {
      key: MENU_KEY.KEY3,
      label: 'Comments',
      children: <Comments task={task} />,
    },
  ];

  // Stores
  const groupList = useSelector((state: RootState) => state.group.groupList);

  // Hooks
  const [form] = Form.useForm();

  // Handlers
  const onClose = () => {
    form.resetFields();
    isClose();
  };

  return (
    <Drawer
      title={<div className="p-3">{task.name}</div>}
      placement="right"
      size={'large'}
      onClose={onClose}
      open={isOpen}
      footer={<></>}
      closeIcon={false}
    >
      <Tabs defaultActiveKey={MENU_KEY.KEY1} items={items} />
    </Drawer>
  );
};
