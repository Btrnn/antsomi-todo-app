// Libraries
import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Icons
import { DeleteIcon, DragIcon, EditIcon } from "components/icons";

// Components
import {
  Input,
  Popconfirm,
  Tag,
  ColorPicker,
  Color,
  Dropdown,
  type MenuProps,
  type MenuInfo,
} from "components/ui";

// Providers
import {
  AppDispatch,
  updateGroup,
  deleteGroup,
  deleteTaskByGroupID,
} from "store";

// Models
import { Group, Task } from "models";

// Constants
import { SORTABLE_TYPE, DROPDOWN_KEY } from "constants/tasks";

//
import { TaskList } from "../TaskList";

interface GroupItemProps {
  group: Group | undefined;
  taskList: Task[];
}

type TState = {
  isRename: boolean;
  groupSelected: string;
  groupNewName: string | undefined;
};

export const GroupItem: React.FC<GroupItemProps> = (props) => {
  const { group, taskList } = props;

  // Drag&Drop
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
    isRename: false,
    groupSelected: "",
    groupNewName: "",
  });

  const { isRename, groupSelected, groupNewName } = state;

  // Handlers
  const onChangeGroupNewName = (
    event: React.ChangeEvent<HTMLInputElement> | undefined
  ) => {
    setState((prev) => ({ ...prev, groupNewName: event?.target.value }));
  };

  const onConfirmDelete = () => {
    dispatch(deleteTaskByGroupID({ groupID: group?.id }));
    dispatch(deleteGroup({ id: group?.id }));
  };

  const onEnterRenameGroup = (groupID: React.Key) => {
    dispatch(
      updateGroup({ id: groupID, updatedGroup: { name: groupNewName } })
    );
    setState((prev) => ({ ...prev, isRename: false, groupNewName: "" }));
  };

  const onClickAction = (
    event: MenuInfo,
    groupID: React.Key,
    groupName: string
  ) => {
    if (event.key === DROPDOWN_KEY.KEY2) {
      setState((prev) => ({
        ...prev,
        isRename: true,
        groupSelected: String(groupID),
        groupNewName: groupName,
      }));
    }
  };

  const onChangeSetColor = (value: Color, groupID: React.Key) => {
    if (typeof value === "string")
      dispatch(updateGroup({ id: groupID, updatedGroup: { color: value } }));
    else if (value && "toHexString" in value) {
      dispatch(
        updateGroup({
          id: groupID,
          updatedGroup: { color: value.toHexString() },
        })
      );
    } else return;
  };

  const items: MenuProps["items"] = [
    {
      label: (
        <Popconfirm
          placement="topLeft"
          title={"Are you sure to delete this group?"}
          description={"Delete the group"}
          okText="Yes"
          cancelText="No"
          onConfirm={onConfirmDelete}
        >
          <div className="flex p-2">
            <DeleteIcon className="mr-3" />
            <div>Delete group</div>
          </div>
        </Popconfirm>
      ),
      key: DROPDOWN_KEY.KEY1,
    },
    {
      label: (
        <div className="flex p-2">
          <EditIcon className="mr-3" />
          <div>Rename</div>
        </div>
      ),
      key: DROPDOWN_KEY.KEY2,
    },
  ];

  return group ? (
    <div
      key={group.id}
      className="flex-shrink-0 w-[270px] h-[70vh]"
      style={{
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }}
      ref={setNodeRef}
      {...attributes}
    >
      <Dropdown
        key={group.id}
        menu={{
          items,
          onClick: (event) => onClickAction(event, group.id, group.name),
        }}
        trigger={["contextMenu"]}
      >
        <div key={group.id} className="flex justify-between">
          {isRename && group.id === groupSelected ? (
            <Input
              className="w-1/2"
              value={groupNewName || group.name}
              onChange={onChangeGroupNewName}
              onPressEnter={() => onEnterRenameGroup(group.id)}
              onBlur={() => onEnterRenameGroup(group.id)}
            />
          ) : (
            <ColorPicker
              trigger="click"
              onChange={(value) => onChangeSetColor(value, group.id)}
            >
              <Tag bordered={false} color={group.color}>
                {group.name}
              </Tag>
            </ColorPicker>
          )}
          <div className="mr-4 text-black" {...listeners}>
            <DragIcon />
          </div>
        </div>
      </Dropdown>

      <TaskList groupInfo={group} taskList={taskList} />
    </div>
  ) : null;
};
