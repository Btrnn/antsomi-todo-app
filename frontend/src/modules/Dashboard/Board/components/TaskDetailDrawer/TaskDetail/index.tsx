// Libraries
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { debounce } from 'lodash';

//Providers
import { RootState, AppDispatch, updateTask } from 'store';

// Icons
import {} from 'components/icons';

// Components
import {
  Tag,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Flex,
  Button,
  message,
} from 'components/ui';

// Models
import { Task } from 'models';

// Services
import { updateTask as updatedTaskAPI } from 'services/task';

// Utils
import { checkAuthority } from 'utils';

// Constants
import { PERMISSION, ROLE_KEY } from 'constants/role';

// Hooks
import { useUserList } from 'hooks/useUserList';

interface TaskDetailProp {
  task: Task | undefined;
  onClose: () => void;
  permission: string;
}

type FormType = Task;

export const TaskDetail: React.FC<TaskDetailProp> = props => {
  const { task, onClose, permission } = props;
  const [messageCreate, contextHolder] = message.useMessage();

  // Store
  const dispatch: AppDispatch = useDispatch();

  // Hooks
  const [form] = Form.useForm();
  const params = useParams();
  const { list: userList } = useUserList();
  const debounceUpdateTask = useCallback(
    debounce(() => form.submit(), 1000),
    [form],
  );

  // Effects
  useEffect(() => {
    if (task) {
      form.setFieldsValue({
        ...task,
        assignee: task.assignee_id !== '' ? task.assignee_id : null,
        start_date: task.start_date ? dayjs(task.start_date) : undefined,
        end_date: task.end_date ? dayjs(task.end_date) : undefined,
        created_at: dayjs(task.created_at),
      });
    }
  }, [task, form]);

  // Handlers
  const onFinishForm = (values: FormType) => {
    const boardId = params?.boardId ?? '';
    if (task) {
      dispatch(updateTask({ id: String(task.id), updatedTask: values }));
      updatedTaskAPI(boardId, { ...values, id: task.id });
    }
  };

  return (
    <>
      {contextHolder}
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
        onValuesChange={debounceUpdateTask}
        onFinish={onFinishForm}
        disabled={!checkAuthority(permission, PERMISSION[ROLE_KEY.EDITOR])}
      >
        <Form.Item<FormType>
          label="Task Title:"
          name="name"
          rules={[{ required: true, message: 'This field is required!' }]}
        >
          <Input placeholder="Enter a brief, clear title for the task" />
        </Form.Item>
        <Form.Item<FormType> label="Description:" name="description">
          <Input.TextArea
            placeholder="Provide a detailed explanation of the task"
            autoSize={{ minRows: 2, maxRows: 8 }}
          />
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
        {/* <Form.Item<FormType> label="Status:" name="status_id">
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
      </Form.Item> */}
        <Form.Item<FormType> label="Estimate time:" name="est_time">
          <InputNumber
            placeholder="Enter the estimated time to complete the task"
            className="w-11/12"
            addonAfter="hours"
          />
        </Form.Item>
        <Form.Item<FormType> label="Start Date:" name="start_date">
          <DatePicker placeholder="Start Date" />
        </Form.Item>
        <Form.Item<FormType> label="End Date:" name="end_date">
          <DatePicker placeholder="End Date" />
        </Form.Item>
      </Form>
    </>
  );
};
