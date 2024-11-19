// Libraries
import dayjs from "dayjs";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Icons
import { UploadIcon } from "components/icons";

// Components
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Tag,
  Upload,
  UploadFile,
  type UploadProps,
} from "components/ui";

// Models
import { Attachment, Task } from "models";

// Utils
import { checkAuthority, getContrastTextColor } from "utils";

// Constants
import { PERMISSION, ROLE_KEY } from "constants/role";
import { BACKEND_URL, OBJECT_TYPE, PRIORITY } from "constants/common";

// Hooks
import { useAccessList, useLoggedUser } from "hooks";

// Queries
import { useDeleteFile, useUpdateTask, useUploadFile } from "queries";

// Types
import { IdentifyId } from "types";
import { deleteFile } from "services";

interface TaskDetailProp {
  task: Task | undefined;
  boardId: IdentifyId;
  permission: string;
}

type FormType = Task;

type TState = {
  attachments: Attachment[];
  fileList: any[];
  uploadList: UploadFile<any>[];
};

export const TaskDetail: React.FC<TaskDetailProp> = (props) => {
  const { task, permission, boardId } = props;
  const [messageCreate, contextHolder] = message.useMessage();

  // States
  //const [attachments, setAttachments] = useState<Attachment[]>([]);
  //const [fileList, setFileList] = useState<any[]>([]);
  const [state, setState] = useState<TState>({
    attachments: [],
    fileList: [],
    uploadList: [],
  });
  const { attachments, fileList, uploadList } = state;

  // Hooks
  const [form] = Form.useForm();
  const params = useParams();
  //const { list: userList } = useUserList();
  const { user: currentUser } = useLoggedUser();
  const { accessList: userList, isLoading: isLoadingAccessList } =
    useAccessList(boardId, OBJECT_TYPE.BOARD);

  // Queries
  const { mutateAsync: updateTask, isError: isUpdateTaskError } = useUpdateTask(
    {
      boardId: params?.boardId ?? "",
    }
  );
  const { mutateAsync: uploadFile, isError: isUploadError } = useUploadFile({
    boardId: params?.boardId ?? "",
    id: task?.id ?? "",
    type: OBJECT_TYPE.TASK,
  });
  const { mutateAsync: deleteFile, isError: isDeleteError } = useDeleteFile({
    boardId: params?.boardId ?? "",
    id: task?.id ?? "",
    type: OBJECT_TYPE.TASK,
  });

  // Effects
  useEffect(() => {
    if (task) {
      setState((prev) => ({
        ...prev,
        attachments: task.attachments || [],
      }));
      form.setFieldsValue({
        ...task,
        start_date: task.start_date ? dayjs(task.start_date) : undefined,
        end_date: task.end_date ? dayjs(task.end_date) : undefined,
        created_at: dayjs(task.created_at),
        priority: task.priority
          ? Object.values(PRIORITY).find((p) => p.key === task.priority)?.key
          : undefined,
        assignee_id: userList.find((user) => user.id === task.assignee_id)
          ? task.assignee_id
          : null,
        reviewer_id: userList.find((user) => user.id === task.reviewer_id)
          ? task.reviewer_id
          : null,
      });
    }
  }, [task, form, isLoadingAccessList]);

  useEffect(() => {
    if (attachments) {
      setState((prev) => ({
        ...prev,
        fileList: attachments.map((file, index) => ({
          uid: index.toString(),
          name: file.filename,
          url: `${BACKEND_URL}${file.path}`,
          path: file.path,
          status: "done",
        })),
      }));
    }
  }, [attachments, task?.attachments]);

  useEffect(() => {
    // if()
    //console.log("uploadList: ",uploadList);
    if (uploadList.length > 0) {
      customRequest(uploadList);
      setState((prev) => ({
        ...prev,
        uploadList: [],
      }));
    }
  }, [uploadList]);

  // Handlers
  const debounceUpdateTask = debounce(() => {
    form.submit();
  }, 1000);

  const onFinishForm = (values: FormType) => {
    if (task) {
      const { attachments, ...otherValues } = values;
      updateTask({
        ...otherValues,
        id: task.id,
        assignee_id: values.assignee_id ? values.assignee_id : null,
      });
      if (isUpdateTaskError) {
        messageCreate.error("Cannot update task!");
      }
    }
  };

  const customRequest = async (files: UploadFile<any>[]) => {
    let updateAttachment: Attachment[] = [];
    for (const file of files) {
      const response = await uploadFile(file.originFileObj as File);
      updateAttachment.push(response.data);
    }
    setState((prev) => ({
      ...prev,
      attachments: [...attachments, ...updateAttachment],
    }));
    if (isUploadError) {
      messageCreate.error("File upload failed.");
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: true,
    customRequest: () => {},
    onChange: async (info) => {
      if (info.file.status !== "removed") {
        const allStatusesDefined = info.fileList.every(
          (file) => file.status !== undefined
        );
        if (allStatusesDefined) {
          setState((prev) => ({
            ...prev,
            uploadList: info.fileList.filter(
              (file) => file.status === "uploading"
            ),
          }));
        }
      }
    },

    async onRemove(e) {
      try {
        const path = e.url ? e.url.split("http://localhost:3000/")[1] : "";

        deleteFile(path);

        const updatedAttachments = [...attachments];
        updatedAttachments.splice(Number(e.uid), 1);
        setState((prev) => ({
          ...prev,
          attachments: updatedAttachments,
        }));
      } catch (error) {
        console.log(error);
      }
    },
  };

  return (
    <>
      {contextHolder}
      <Form<FormType>
        style={{
          maxWidth: 700,
          width: "full",
          height: "full",
          padding: "12px",
        }}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        layout="horizontal"
        labelAlign="left"
        form={form}
        onValuesChange={(changedValues: any, values: Task) =>
          !Object.keys(changedValues).some((key) => key === "attachments") &&
          debounceUpdateTask()
        }
        onFinish={onFinishForm}
        disabled={!checkAuthority(permission, PERMISSION[ROLE_KEY.EDITOR])}
      >
        <Form.Item<FormType>
          label="Task Title:"
          name="name"
          rules={[{ required: true, message: "This field is required!" }]}
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
            options={Object.values(PRIORITY).map((priority) => ({
              value: priority.key,
              label: priority.label,
              color: priority.color,
            }))}
            optionRender={(option) => {
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
            options={userList.map((user) => ({
              value: user.id,
              label: user.name,
              email: user.email,
            }))}
            optionRender={(option) => {
              const { label, value, email } = option.data;
              return (
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span>{label}</span>
                    <span className="font-light">{email}</span>
                  </div>
                  {value === (currentUser?.id as string) ? (
                    <Tag>You</Tag>
                  ) : (
                    <></>
                  )}
                </div>
              );
            }}
          />
        </Form.Item>
        <Form.Item<FormType> label="Reviewer:" name="reviewer_id">
          <Select
            placeholder="The person responsible for reviewing and evaluating the task."
            options={userList.map((user) => ({
              value: user.id,
              label: user.name,
              email: user.email,
            }))}
            optionRender={(option) => {
              const { label, value, email } = option.data;
              return (
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span>{label}</span>
                    <span className="font-light">{email}</span>
                  </div>
                  {value === (currentUser?.id as string) ? (
                    <Tag>You</Tag>
                  ) : (
                    <></>
                  )}
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
        <Form.Item<FormType> label="Attachments:" name="attachments">
          <Upload.Dragger
            listType="picture"
            fileList={fileList}
            {...uploadProps}
          >
            <p className="ant-upload-drag-icon">
              <UploadIcon />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibited from
              uploading company data or other banned files.
            </p>
          </Upload.Dragger>
          {/* <Upload
            listType="picture"
            fileList={
              form.getFieldValue("attachments")?.map((file, index) => ({
                uid: index.toString(), 
                name: file.name, 
                url: file.url,
              })) || []
            }
            {...uploadProps}
          /> */}
        </Form.Item>
      </Form>
    </>
  );
};
