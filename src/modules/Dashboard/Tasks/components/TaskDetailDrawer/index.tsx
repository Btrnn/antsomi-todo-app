// Libraries
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';

//Providers
import { RootState, AppDispatch, updateTask } from 'store';

// Icons
import {} from 'components/icons';

// Components
import {
  Button,
  Tag,
  Form,
  Input,
  Select,
  DatePicker,
  Flex,
  Drawer,
  InputNumber,
  Tabs,
  type TabsProps,
} from 'components/ui';

// Models
import { Task } from 'models';

// Services
import { updateTask as updatedTaskAPI } from 'services/task';

// Constants
import { MENU_KEY } from 'constants/tasks';

interface TaskDetailProp {
  task: Task;
  isOpen: boolean;
  isClose: () => void;
}

type FormType = Task;

const items: TabsProps['items'] = [
  {
    key: MENU_KEY.KEY1,
    label: 'Overview',
    children: 'Content of Tab Pane 1',
  },
  {
    key: MENU_KEY.KEY2,
    label: 'Subtasks',
    children: 'Content of Tab Pane 2',
  },
  {
    key: MENU_KEY.KEY3,
    label: 'Comments',
    children: 'Content of Tab Pane 3',
  },
];

export const TaskDetail: React.FC<TaskDetailProp> = props => {
  const { task, isOpen, isClose } = props;

  // Hooks
  const [form] = Form.useForm();

  // Store
  const dispatch: AppDispatch = useDispatch();
  const userList = useSelector((state: RootState) => state.user.userList);
  const groupList = useSelector((state: RootState) => state.group.groupList);

  // Effects
  useEffect(() => {
    form.setFieldsValue({
      ...task,
      start_date: dayjs(task.start_date),
      end_date: dayjs(task.end_date),
      created_at: dayjs(task.created_at),
    });
  }, [task, isOpen, form]);

  // Handlers
  const onFinishForm = (values: FormType) => {
    dispatch(updateTask({ id: String(task.id), updatedTask: values }));
    updatedTaskAPI(task.id, values);
    isClose();
  };

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
      footer={
        <Flex gap={10} justify="right">
          <Form.Item>
            <Button onClick={onClose}>Cancel</Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={() => form.submit()}>
              Save
            </Button>
          </Form.Item>
        </Flex>
      }
      closeIcon={false}
    >
      <Tabs defaultActiveKey={MENU_KEY.KEY1} items={items} />
      <Form<FormType>
        style={{
          maxWidth: 700,
          width: 'full',
          height: 'full',
          padding: '12px',
        }}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        layout="horizontal"
        labelAlign="left"
        form={form}
        onFinish={onFinishForm}
      >
        <Form.Item<FormType>
          label="Task Title:"
          name="name"
          rules={[{ required: true, message: 'This field is required!' }]}
        >
          <Input placeholder="Enter a brief, clear title for the task" />
        </Form.Item>
        <Form.Item<FormType> label="Description:" name="description">
          <Input placeholder="Provide a detailed explanation of the task" />
        </Form.Item>
        <Form.Item<FormType> label="Assignee:" name="assignee_id">
          <Select
            placeholder="Select the person responsible for this task"
            options={userList.map(user => ({
              value: user.id,
              label: user.name,
            }))}
          />
        </Form.Item>
        <Form.Item<FormType> label="Status:" name="status_id">
          <Select
            options={groupList.map(group => ({
              value: group.id,
              label: (
                <Tag bordered={false} color={group.color} className="justify-center">
                  {group.name}
                </Tag>
              ),
            }))}
          />
        </Form.Item>
        <Form.Item<FormType> label="Estimate time:" name="est_time">
          <InputNumber
            placeholder="Enter the estimated time to complete the task"
            className="w-11/12"
            addonAfter="hours"
          />
        </Form.Item>
        <Form.Item<FormType> label="Start Date:" name="start_date">
          <DatePicker />
        </Form.Item>
        <Form.Item<FormType> label="End Date:" name="end_date">
          <DatePicker />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
