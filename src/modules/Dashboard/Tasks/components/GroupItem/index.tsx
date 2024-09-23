// Libraries
import React, { useState } from "react";
import { useDispatch } from "react-redux";

import {
  useSortable,
} from "@dnd-kit/sortable";
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

//
import { TaskList } from "../TaskList";


interface GroupItemProps {
  group: Group | undefined;
  taskList: Task[];
}

export const GroupItem: React.FC<GroupItemProps> = (props) => {
  const { group, taskList } = props;
  let confirmDelete = false;

  // Drag&Drop
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: String(group?.id),
      data: { type: 'group' },
});

  // Store
  const dispatch: AppDispatch = useDispatch();

  // State
  const [state, setState] = useState({
    tasks: [],
    error: "",
    inputGroupName: "",
    confirmDelete: false,
    isRenaming: false,
    groupSelected: "",
    groupNewName: "",
  });

  // Handlers
  const onChangeGroupNewName = (event: any) => {
    setState((prev) => ({ ...prev, groupNewName: event.target.value }));
  };

  const onConfirmDelete = () => {
    confirmDelete = true;
  };

  const handleDeleteGroup = (groupID: React.Key) => {
    dispatch(deleteTaskByGroupID({ groupID }));
    dispatch(deleteGroup({ id: groupID }));
    confirmDelete = false;
  };

  const onEnterRenameGroup = (groupID: React.Key) => {
    dispatch(
      updateGroup({ id: groupID, updatedGroup: { name: state.groupNewName } })
    );
    setState((prev) => ({ ...prev, isRenaming: false, groupNewName: "" }));
  };

  const onClickAction = (event: any, groupID: any, groupName: string) => {
    if (event.key === "2") {
      setState((prev) => ({
        ...prev,
        isRenaming: true,
        groupSelected: groupID,
        groupNewName: groupName,
      }));
    } else if (event.key === "1" && confirmDelete) {
      handleDeleteGroup(groupID);
    }
  };

  const onChangeSetColor = (value: Color, groupID: React.Key) => {
    if (typeof value === "string")
      dispatch(updateGroup({ id: groupID, updatedGroup: { color: value } }));
    else if (value && "toHexString" in value)
      dispatch(
        updateGroup({
          id: groupID,
          updatedGroup: { color: value.toHexString() },
        })
      );
    else
      dispatch(updateGroup({ id: groupID, updatedGroup: { color: "#ffff" } }));
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
      key: "1",
    },
    {
      label: (
        <div className="flex p-2">
          <EditIcon className="mr-3" />
          <div>Rename</div>
        </div>
      ),
      key: "2",
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
          {state.isRenaming && group.id === state.groupSelected ? (
            <Input
              className="w-1/2"
              value={state.groupNewName || group.name}
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
