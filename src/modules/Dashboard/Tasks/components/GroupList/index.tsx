// Libraries
import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useSelector, useDispatch } from "react-redux";

// Icons
import {
  AddIcon,
} from "components/icons";

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
  reorderTask
} from "store";

// Models
import { Task } from "models";

//
import { TaskList } from "../TaskList";
import { some } from "lodash";



interface GroupProps {
  id: any;
  groupTitle: string;
  type: string;
  tasks: Task[];
}

export const Groups: React.FC<GroupProps> = (props) => {
  const { id, groupTitle, type, tasks } = props;
  let confirmDelete = false;

  // Store
  const dispatch: AppDispatch = useDispatch();
  const groupList = useSelector((state: RootState) => state.group.groupList);

  // State
  const [state, setState] = useState({
    groupType: groupTitle,
    tasks: [],
    error: "",
    inputGroupName: "",
    confirmDelete: false,
    isRenaming: false,
    groupSelected: "",
    groupNewName: "",
  });

  // Handlers
  const onChangeInputGroup = (event: any) => {
    setState((prev) => ({ ...prev, inputGroupName: event.target.value }));
  };

  const onChangeGroupNewName = (event: any) => {
    setState((prev) => ({ ...prev, groupNewName: event.target.value }));
  };

  const onClickAddGroup = () => {
    const newGroup = { name: state.inputGroupName, type: type };
    dispatch(addGroup(newGroup));
  };

  const onConfirmDelete = () => {
    confirmDelete = true;
  };

  const handleDeleteGroup = (groupID: any) => {
    dispatch(deleteGroup(groupID));
    confirmDelete = false;
  };

  const onEnterRenameGroup = (groupID: React.Key) => {
    dispatch(updateGroup({ id: groupID, updatedGroup: { name: state.groupNewName } }));
    setState((prev) => ({...prev, isRenaming: false, groupNewName: ""}));
  };


  const onClickAction = (event: any, groupID: any) => {
    if (event.key == 1) {
      console.log("Rename");
      setState((prev) => ({
        ...prev,
        isRenaming: true,
        groupSelected: groupID,
      }));
    } else if (event.key == 2 && confirmDelete) {
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

  const onDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    console.log(result)
    if (!destination || source === destination) return;
    dispatch(
      reorderTask({
        source: source,
        destination: destination,
        taskID: draggableId,
      })
    );
  };

  const items: MenuProps["items"] = [
    {
      label: <div className="flex p-2">Rename</div>,
      key: "1",
    },
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
          <div className="flex p-2">Delete</div>
        </Popconfirm>
      ),
      key: "2",
    },
  ];

  return (
    <Flex
      justify="space-between"
      align={"flex-start"}
      className="gap-5 overflow-x-auto w-full flex-shrink-0"
    >
      <div className="flex gap-1 mt-11 flex-shrink-0 w-1/5">
        <Input
          className="p-2"
          placeholder="Add new group"
          value={state.inputGroupName}
          onChange={onChangeInputGroup}
          onPressEnter={onClickAddGroup}
        />
        <Button className="w-9 h-9" onClick={onClickAddGroup}>
          <AddIcon />
        </Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        {groupList.map((group, index) => (
          <div key={index} className="flex-shrink-0 w-1/5">
            <Dropdown
              menu={{
                items,
                onClick: (event) => onClickAction(event, group.id),
              }}
              trigger={["contextMenu"]}
            >
              {state.isRenaming && group.id === state.groupSelected ? (
                <div>
                  <Input
                    className="w-3/6"
                    value={state.groupNewName || group.name}
                    onChange={onChangeGroupNewName}
                    onPressEnter={() => onEnterRenameGroup(group.id)}
                  />
                </div>
              ) : (
                <div>
                  <ColorPicker
                    trigger="click"
                    onChange={(value) => onChangeSetColor(value, group.id)}
                  >
                    <Tag bordered={false} color={group.color}>
                      {group.name}
                    </Tag>
                  </ColorPicker>
                </div>
              )}
            </Dropdown>
            <Droppable key={index} droppableId={String(group.id)}>
              {(provided) => (
                <div ref={provided.innerRef}>
                  <TaskList groupInfo={group} />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
        ;
      </DragDropContext>
    </Flex>
  );
};
