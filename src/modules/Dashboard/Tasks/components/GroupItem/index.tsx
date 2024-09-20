// Libraries
import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useSelector, useDispatch } from "react-redux";
import {
  DndContext,
  useDroppable,
  useDraggable,
  UniqueIdentifier,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  closestCenter,
  DragEndEvent,
  closestCorners,
  rectIntersection,
  pointerWithin,
} from "@dnd-kit/core";
import {
  useSortable,
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Icons
import { AddIcon, DeleteIcon, DragIcon, EditIcon } from "components/icons";

// Components
import {
  Button,
  Input,
  Popconfirm,
  Flex,
  Tag,
  ColorPicker,
  Color,
  Dropdown,
  type MenuProps,
} from "components/ui";

// Providers
import {
  RootState,
  AppDispatch,
  addGroup,
  updateGroup,
  deleteGroup,
  reorderTask,
  deleteTaskByGroupID,
  reorderGroup,
} from "store";

// Models
import { Group, Task } from "models";

//
import { TaskList } from "../TaskList";
import { TaskItem } from "../TaskItem";

import {
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "components/ui/DragDrop";

interface GroupItemProps {
  group: Group;
  activeTask: React.Key|null;
  isActive: boolean;
}


export const GroupItem: React.FC<GroupItemProps> = (props) => {
  const { group, activeTask, isActive } = props;
  let confirmDelete = false;

  // Drag&Drop
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: String(group?.id),
      data: { containerId: '' },
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
    if (event.key == 2) {
      setState((prev) => ({
        ...prev,
        isRenaming: true,
        groupSelected: groupID,
        groupNewName: groupName,
      }));
    } else if (event.key == 1 && confirmDelete) {
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

  return (
    <div
      key={group.id}
      className="flex-shrink-0 w-1/5"
      style={{
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: isActive ? 0.5 : 1,
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
        <div key={group.id} className="flex">
          {state.isRenaming && group.id === state.groupSelected ? (
            <Input
              className="w-1/2"
              value={state.groupNewName || group.name}
              onChange={onChangeGroupNewName}
              onPressEnter={() => onEnterRenameGroup(group.id)}
            />
          ) : (
            <ColorPicker
              trigger="click"
              onChange={(value) => onChangeSetColor(value, group.id)}
            >
              <Tag bordered={false} color={group.color}>
                {group.name}{" "}
              </Tag>
            </ColorPicker>
          )}
          <div {...listeners}>
            <DragIcon />
          </div>
        </div>
      </Dropdown>

      <TaskList groupInfo={group} activeTask={activeTask} />
    </div>
  );
};
