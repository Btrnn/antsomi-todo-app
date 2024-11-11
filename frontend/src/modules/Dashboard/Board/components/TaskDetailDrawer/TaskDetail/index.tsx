// Libraries
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

//Providers

// Icons
import {} from 'components/icons';

// Components
import { DatePicker, Form, Input, InputNumber, message, Select, Tag } from 'components/ui';

// Models
import { Task } from 'models';

// Utils
import { checkAuthority, getContrastTextColor } from 'utils';

// Constants
import { PERMISSION, ROLE_KEY } from 'constants/role';

// Hooks
import { useAccessList, useLoggedUser, useUserList } from 'hooks';
import { useUpdateTask } from 'queries';
import { IdentifyId } from 'types';
import { OBJECT_TYPE, PRIORITY } from 'constants/common';
import { queryOptions } from '@tanstack/react-query';

interface TaskDetailProp {
  task: Task | undefined;
  boardId: IdentifyId;
  permission: string;
}

type FormType = Task;

export const TaskDetail: React.FC<TaskDetailProp> = props => {
  const { task, permission, boardId } = props;
  const [messageCreate, contextHolder] = message.useMessage();

  // Hooks
  const [form] = Form.useForm();
  const params = useParams();
  //const { list: userList } = useUserList();
  const { user: currentUser } = useLoggedUser();
  const { accessList: userList } = useAccessList(boardId, OBJECT_TYPE.BOARD);

  // Queries
  const { mutateAsync: updateTask, isError: isUpdateTaskError } = useUpdateTask({
    boardId: params?.boardId ?? '',
  });

  // Effects
  useEffect(() => {
    if (task) {
      form.setFieldsValue({
        ...task,
        start_date: task.start_date ? dayjs(task.start_date) : undefined,
        end_date: task.end_date ? dayjs(task.end_date) : undefined,
        created_at: dayjs(task.created_at),
        priority: task.priority
          ? Object.values(PRIORITY).find(p => p.key === task.priority)
          : undefined,
      });
    }
  }, [task, form]);

  // Handlers
  const debounceUpdateTask = debounce(() => {
    form.submit();
  }, 2000);

  const onFinishForm = (values: FormType) => {
    if (task) {
      updateTask({
        ...values,
        id: task.id,
        assignee_id: values.assignee_id ? values.assignee_id : null,
      });
      if (isUpdateTaskError) {
        messageCreate.error('Cannot update task!');
      }
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
        <Form.Item<FormType> label="Priority:" name="priority">
          <Select
            placeholder="Defines the importance level of the task for prioritization."
            options={Object.values(PRIORITY).map(priority => ({
              value: priority.key,
              label: priority.label,
              color: priority.color,
            }))}
            optionRender={option => {
              const { label, color } = option.data;
              return (
                <Tag
                  bordered={false}
                  color={color}
                  className="justify-center items-center"
                  style={{ color: getContrastTextColor(color) }}
                >
                  {label}
                </Tag>
              );
            }}
          />
        </Form.Item>
        <Form.Item<FormType> label="Assignee:" name="assignee_id">
          <Select
            placeholder="Select the person responsible for this task"
            options={userList.map(user => ({
              value: user.id,
              label: user.name,
              email: user.email,
            }))}
            optionRender={option => {
              const { label, value, email } = option.data;
              return (
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span>{label}</span>
                    <span className="font-light">{email}</span>
                  </div>
                  {value === (currentUser?.id as string) ? <Tag>You</Tag> : <></>}
                </div>
              );
            }}
          />
        </Form.Item>
        <Form.Item<FormType> label="Reviewer:" name="reviewer_id">
          <Select
            placeholder="The person responsible for reviewing and evaluating the task."
            options={userList.map(user => ({
              value: user.id,
              label: user.name,
              email: user.email,
            }))}
            optionRender={option => {
              const { label, value, email } = option.data;
              return (
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span>{label}</span>
                    <span className="font-light">{email}</span>
                  </div>
                  {value === (currentUser?.id as string) ? <Tag>You</Tag> : <></>}
                </div>
              );
            }}
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
          <DatePicker placeholder="Start Date" />
        </Form.Item>
        <Form.Item<FormType> label="End Date:" name="end_date">
          <DatePicker placeholder="End Date" />
        </Form.Item>
      </Form>
    </>
  );
};
