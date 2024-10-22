// Libraries
import { useSelector, useDispatch } from 'react-redux';
import React, { useEffect } from 'react';

//Providers
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

interface TaskDrawerProp {
  task: Task;
  isOpen: boolean;
  isClose: () => void;
  permission: string;
}

export const TaskDrawer: React.FC<TaskDrawerProp> = props => {
  const { task, isOpen, isClose, permission } = props;
  const [messageCreate, contextHolder] = message.useMessage();

  // Stores
  const groupList = useSelector((state: RootState) => state.group.groupList);

  // Hooks
  const [form] = Form.useForm();

  // Handlers
  const onClose = (message: string) => {
    form.resetFields();
    if (message !== '') {
      messageCreate.open({
        type: 'success',
        content: message,
      });
    }
    isClose();
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
      children: <SubTasks task={task} />,
    },
    {
      key: MENU_KEY.KEY3,
      label: 'Comments',
      children: <Comments task={task} />,
    },
  ];

  return (
    <>
      {contextHolder}
      <Drawer
        title={<div className="p-3">{task.name}</div>}
        placement="right"
        size={'large'}
        onClose={isClose}
        open={isOpen}
        footer={<></>}
        closeIcon={false}
      >
        <Tabs defaultActiveKey={MENU_KEY.KEY1} items={items} />
      </Drawer>
    </>
  );
};
