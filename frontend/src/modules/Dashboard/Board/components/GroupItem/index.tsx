// Libraries
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ConfigProvider } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

// Icons
import {
  AddFilledIcon,
  ClearIcon,
  ColorIcon,
  DeleteIcon,
  DragIcon,
  EditIcon,
  MoreIcon,
} from "components/icons";

// Components
import {
  Card,
  Color,
  ColorPicker,
  Dropdown,
  Input,
  message,
  Modal,
  Tag,
  type MenuInfo,
  type MenuProps,
} from "components/ui";
import { TaskList } from "../TaskList";

// Providers
import {
  AppDispatch,
} from "store";

// Models
import { Group, Task } from "models";

// Constants
import { MENU_KEY, SORTABLE_TYPE, PERMISSION, ROLE_KEY } from "constant";

// Services
import {
  getAllTasks
} from "services/task";

// Utils
import { checkAuthority, getContrastTextColor } from "utils";

// Queries
import { useCreateTask, useDeleteTaskByGroupID, useUpdateGroup } from "queries";

interface GroupItemProps {
  group: Group | undefined;
  allTasks: Task[];
  onDelete: (id: React.Key) => Promise<void>;
  isOverlay: boolean;
  isRearrange: boolean;
  boardId: React.Key;
  permission: string;
}

type TState = {
  isAdding: boolean;
  inputTask: string;
  isRename: boolean;
  groupSelected: string;
  groupNewName: string | undefined;
  error: string;
  isOpen: boolean;
  taskList: Task[];
  textColor: string;
  isClicked: boolean;
  isChanged: boolean;
  isChangeColor: boolean;
};

export const GroupItem: React.FC<GroupItemProps> = (props) => {
  const { group, onDelete, isOverlay, allTasks, boardId, permission } = props;
  const [messageCreate, contextHolder] = message.useMessage();

  // Queries
  const { mutateAsync: createTask, isError: isCreateTaskError } = useCreateTask(
    { boardId }
  );
  const {
    mutateAsync: deleteTaskByGroupID,
    isError: isDeleteTaskByGroupIDError,
  } = useDeleteTaskByGroupID({ boardId });
  const { mutateAsync: updateGroup, isError: isUpdateGroupError } =
    useUpdateGroup({ boardId });

  // Hooks
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(group?.id),
    data: { type: SORTABLE_TYPE.GROUP },
  });
  

  // Store
  const dispatch: AppDispatch = useDispatch();

  // State
  const [state, setState] = useState<TState>({
    isAdding: false,
    inputTask: "",
    isRename: false,
    groupSelected: "",
    groupNewName: "",
    error: "",
    isOpen: false,
    taskList: [],
    textColor: "#FFFFFF",
    isClicked: false,
    isChanged: false,
    isChangeColor: false,
  });

  const {
    isAdding,
    inputTask,
    isRename,
    groupSelected,
    groupNewName,
    error,
    isOpen,
    taskList,
    textColor,
    isChangeColor,
  } = state;

  useMemo(() => {
     if (group) {
      setState((prev) => ({
        ...prev,
        textColor: getContrastTextColor(group.color),
        taskList: allTasks.filter((task) => task.status_id === group.id),
      }));
    }
  }, [allTasks]);

  const onChangeGroupNewName = (
    event: React.ChangeEvent<HTMLInputElement> | undefined
  ) => {
    setState((prev) => ({ ...prev, groupNewName: event?.target.value }));
  };

  const onConfirmDelete = () => {
    if (group) {
      //dispatch(deleteTaskByGroupID({ groupID: group?.id }));
      onDelete(group.id);
    }
  };

  const onConfirmClear = () => {
    if (group) {
      //dispatch(deleteTaskByGroupID({ groupID: group?.id }));
      // deleteTaskByGroupIDAPI(group.board_id, group.id);
      deleteTaskByGroupID(group.id);
      if (!isDeleteTaskByGroupIDError) {
        messageCreate.open({
          type: "success",
          content: <div>Group cleared!</div>,
        });
      } else {
        messageCreate.open({
          type: "error",
          content: "Cannot clear tasks!",
        });
      }
    }
  };

  const onEnterRenameGroup = (groupID: React.Key) => {
    if (groupNewName !== "") {
      // dispatch(
      //   updateGroup({ id: groupID, updatedGroup: { name: groupNewName } })
      // );
      updateGroup({ id: groupID, name: groupNewName });
      if (!isUpdateGroupError) {
        messageCreate.open({
          type: "success",
          content: "Group updated!",
        });
      } else {
        messageCreate.open({
          type: "error",
          content: "Cannot update group!",
        });
      }
      // updateGroupAPI(boardId, {  id: groupID, name: groupNewName });
    }
    if (!isChangeColor)
      setState((prev) => ({ ...prev, isRename: false, groupNewName: "" }));
  };

  const onClickAction = (
    event: MenuInfo,
    groupID: React.Key,
    groupName: string
  ) => {
    if (event.key === MENU_KEY.KEY2) {
      onClickBeginRenaming(groupID, groupName);
    }
    setState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  const onClickBeginRenaming = (groupID: React.Key, groupName: string) => {
    if (checkAuthority(permission, PERMISSION[ROLE_KEY.EDITOR])) {
      setState((prev) => ({
        ...prev,
        isRename: true,
        groupSelected: String(groupID),
        groupNewName: groupName,
      }));
    }
  };

  const onChangeSetColor = (value: Color, groupID: React.Key) => {
    if (typeof value === "string") {
      // dispatch(updateGroup({ id: groupID, updatedGroup: { color: value } }));
      // updateGroupAPI(boardId,{ id: groupID, color: value });
      updateGroup({ id: groupID, color: value });
      setState((prev) => ({ ...prev, textColor: getContrastTextColor(value) }));
    } else if (value && "toHexString" in value) {
      // dispatch(
      //   updateGroup({
      //     id: groupID,
      //     updatedGroup: { color: value.toHexString() },
      //   })
      // );
      // updateGroupAPI(boardId, {  id: groupID, color: value.toHexString() });
      updateGroup({ id: groupID, color: value.toHexString() });
      setState((prev) => ({
        ...prev,
        textColor: getContrastTextColor(value.toHexString()),
      }));
    } else {
      return;
    }
  };

  const onChangeInputTask = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, inputTask: event.target.value }));
  };

  const onClickAddTask = async () => {
    let errorMessage = "";
    let isAdd = true;

    if (inputTask.length === 0) {
      isAdd = false;
    } else if (inputTask.length > 255) {
      errorMessage = "Name is too long, max length is 255 characters";
    } else if (allTasks.some((task) => task.name === inputTask)) {
      errorMessage = "Task already exists!";
    }

    if (!errorMessage && group && inputTask.length !== 0 && isAdd) {
      const newTask: Omit<
        Task,
        "id" | "created_at" | "start_date" | "end_date" | "owner_id"
      > = {
        name: inputTask,
        description: "",
        est_time: null,
        assignee_id: null,
        status_id: group.id,
        position: taskList.length,
        reviewer_id: null,
        priority: null,
        attachments: null,
      };

      createTask(newTask);
      if (!isCreateTaskError) {
        messageCreate.open({
          type: "success",
          content: <div>New task added!</div>,
        });
      } else {
        messageCreate.open({
          type: "error",
          content: "Cannot add task!",
        });
      }
      isAdd = false;
    }

    setState((prev) => ({
      ...prev,
      inputTask: "",
      error: errorMessage,
      isAdding: isAdd,
    }));
  };

  const onClickBeginAdding = () => {
    if (checkAuthority(permission, PERMISSION[ROLE_KEY.EDITOR])) {
      if (isAdding === true) {
        setState((prev) => ({ ...prev, isAdding: false }));
      } else {
        setState((prev) => ({ ...prev, isAdding: true, error: "" }));
      }
    }
  };

  const onClickShowDropDown = () => {
    if (checkAuthority(permission, PERMISSION[ROLE_KEY.EDITOR])) {
      if (!isOpen) {
        setState((prev) => ({
          ...prev,
          isOpen: true,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isOpen: false,
        }));
      }
    }
  };

  const onClickChangeOpen = () => {
    if (checkAuthority(permission, PERMISSION[ROLE_KEY.EDITOR])) {
      if (!isOpen) {
        setState((prev) => ({
          ...prev,
          isOpen: true,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isOpen: false,
        }));
      }
    }
  };

  const onClickChangeColor = (event: React.MouseEvent) => {
    setState((prev) => ({
      ...prev,
      isChangeColor: true,
    }));
  };

  const onClickCloseColorPicker = (open: boolean) => {
    if (!open) {
      setState((prev) => ({
        ...prev,
        isChangeColor: false,
        isRename: false,
        groupSelected: "",
      }));
    }
  };

  const items: MenuProps["items"] = [
    {
      label: (
        <div className="flex p-2">
          <EditIcon className="mr-3" />
          <div>Rename</div>
        </div>
      ),
      key: MENU_KEY.KEY2,
    },
    {
      label: (
        <div
          className="flex p-2"
          onClick={() => {
            if (checkAuthority(permission, PERMISSION[ROLE_KEY.EDITOR])) {
              Modal.confirm({
                title: "Are you sure you want to clear this group?",
                content: (
                  <div className="text-gray-700 text-xs">
                    All tasks belong to it will be removed.
                  </div>
                ),
                footer: (_, { OkBtn, CancelBtn }) => (
                  <>
                    <CancelBtn />
                    <OkBtn />
                  </>
                ),
                onOk: onConfirmClear,
              });
            }
          }}
        >
          <ClearIcon className="mr-3" />
          <div>Clear</div>
        </div>
      ),
      key: MENU_KEY.KEY3,
    },
    {
      label: (
        <div
          className="flex p-2 text-red-500"
          onClick={() => {
            if (checkAuthority(permission, PERMISSION[ROLE_KEY.EDITOR])) {
              Modal.confirm({
                title: "Are you sure you want to delete this group?",
                content: (
                  <div className="text-gray-700 text-xs">
                    Deleting this group will remove all its tasks.
                  </div>
                ),
                footer: (_, { OkBtn, CancelBtn }) => (
                  <>
                    <CancelBtn />
                    <OkBtn />
                  </>
                ),
                onOk: onConfirmDelete,
              });
            }
          }}
        >
          <DeleteIcon className="mr-3" />
          <div>Delete</div>
        </div>
      ),
      key: MENU_KEY.KEY1,
    },
  ];


  return (
    <>
      {contextHolder}
      {group ? (
        <Card
          title={
            <div
              key={group.id}
              className="flex flex-row justify-between items-center py-[10px] mt-5"
            >
              <Tag
                bordered={false}
                className="text-[13px] py-[8px] px-[14px] rounded-full bg-[#d9d9d9] mr-3 text-[#595959] font-bold"
              >
                {taskList.length}
              </Tag>
              <div
                key={group.id}
                className="flex flex-row w-full justify-between items-center"
              >
                {isRename && group.id === groupSelected ? (
                  <ConfigProvider
                    theme={{ components: { Input: { addonBg: group.color } } }}
                  >
                    <Input
                      className="w-1/2 h-full"
                      style={{
                        boxShadow: "none",
                        borderColor: "transparent",
                      }}
                      autoFocus={true}
                      value={groupNewName}
                      onChange={onChangeGroupNewName}
                      onPressEnter={() => onEnterRenameGroup(group.id)}
                      onBlur={(e) => {
                        onEnterRenameGroup(group.id);
                      }}
                      addonAfter={
                        <div
                          onMouseDown={(e) => {
                            e.preventDefault();
                            onClickChangeColor(e);
                          }}
                        >
                          <ColorPicker
                            trigger="click"
                            onChange={(value) =>
                              onChangeSetColor(value, group.id)
                            }
                            defaultValue={group.color}
                            onOpenChange={(open) =>
                              onClickCloseColorPicker(open)
                            }
                          >
                            <ColorIcon
                              style={{
                                color: getContrastTextColor(group.color),
                              }}
                            />
                          </ColorPicker>
                        </div>
                      }
                    />
                  </ConfigProvider>
                ) : (
                  <Tag
                    bordered={false}
                    color={group.color}
                    className="text-[14px] font-semibold py-[8px] px-[14px]"
                    style={{ color: textColor }}
                    onClick={() => onClickBeginRenaming(group.id, group.name)}
                  >
                    {group.name}
                  </Tag>
                )}
                {checkAuthority(permission, PERMISSION[ROLE_KEY.EDITOR]) && (
                  <div className="flex flex-row items-center text-[20px]">
                    <AddFilledIcon
                      className="mr-2 text-black"
                      onClick={onClickBeginAdding}
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                    />
                    <Dropdown
                      key={group.id}
                      menu={{
                        items,
                        onClick: (event) =>
                          onClickAction(event, group.id, group.name),
                      }}
                      placement="bottomLeft"
                      open={isOpen}
                      trigger={["click"]}
                      onOpenChange={onClickChangeOpen}
                    >
                      <MoreIcon
                        className="mr-2 text-black"
                        onClick={onClickShowDropDown}
                      />
                    </Dropdown>
                    <div
                      className="text-black text-[25px]"
                      {...(checkAuthority(
                        permission,
                        PERMISSION[ROLE_KEY.EDITOR]
                      )
                        ? listeners
                        : {})}
                    >
                      <DragIcon />
                    </div>
                  </div>
                )}
              </div>
            </div>
          }
          bordered={false}
          key={group.id}
          style={{
            transition,
            transform: CSS.Transform.toString(transform),
            opacity: isDragging ? 0.5 : 1,
            backgroundColor: isOverlay ? "rgba(245, 245, 245, 0.5)" : "#f5f5f5",
            height: "100%",
            backdropFilter: isOverlay ? "blur(10px)" : "none",
            boxShadow: "0 3px 4px rgba(0, 0, 0, 0.1)",
          }}
          className="flex flex-col"
          classNames={{
            header: "shrink-0",
            body: "h-full overflow-auto",
          }}
          ref={setNodeRef}
          {...attributes}
        >
          {isAdding && (
            <div className="mb-2 w-full">
              <Input
                className="flex flex-row p-[10px] w-full"
                placeholder="Add new task"
                style={{
                  outline: "none",
                  boxShadow: "none",
                  borderColor: "transparent",
                  width: "100%",
                  maxWidth: "400px",
                }}
                value={inputTask}
                onChange={onChangeInputTask}
                onPressEnter={onClickAddTask}
                autoFocus={true}
                onBlur={onClickAddTask}
              />
              {error === "" ? (
                <div className="p-[10px] w-full text-[#595959]">
                  Press Enter to create new task
                </div>
              ) : (
                <div className="text-red-500 p-[10px] w-full">{error}</div>
              )}
            </div>
          )}
          <TaskList group={group} taskList={taskList} permission={permission} />
        </Card>
      ) : null}
    </>
  );
};
