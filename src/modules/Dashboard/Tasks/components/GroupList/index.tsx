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
import { Task } from "models";

//
import { TaskList } from "../TaskList";
import { TaskItem } from "../TaskItem";
import { GroupItem } from "../GroupItem";

import {
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "components/ui/DragDrop";

interface GroupsProps {
  id: any;
  groupTitle: string;
  type: string;
  tasks: Task[];
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

export const Groups: React.FC<GroupsProps> = (props) => {
  const { id, groupTitle, type, tasks } = props;
  const sensors = useSensors(useSensor(MouseSensor));

  // Store
  const dispatch: AppDispatch = useDispatch();
  const groupList = useSelector((state: RootState) => state.group.groupList);
  const taskList = useSelector((state: RootState) => state.task.taskList);

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
    activeId: null,
    activeType: null,
  });
  const { activeId, activeType } = state;

  // Handlers
  const onChangeInputGroup = (event: any) => {
    setState((prev) => ({ ...prev, inputGroupName: event.target.value }));
  };

  const onClickAddGroup = () => {
    const newGroup = { name: state.inputGroupName, type: type };
    dispatch(addGroup(newGroup));
  };

  const onDragEnd = (event: any) => {
    console.log("🚀 ~ onDragEnd ~ event:", event);
    const { active, over } = event;

    if (!over) return;

    // if (
    //   active.data.current.containerId !== "" &&
    //   over.data.current.containerId !== ""
    // ) {
    //   dispatch(reorderTask({ source: active, destination: over }));
    // } else {
    //   dispatch(reorderGroup({ source: active, destination: over }));
    //   console.log("group: ");
    // }

    /**
     * NOTE: Handle reorder task, group
     * - Check active type: task or group
     * - Check destination type: task or group
     * - Reorder task: same group
     * - Reorder group: different group
     *
     * @example
     * - Active: task, Destination: task -> Reorder task
     * - Active: task, Destination: group -> Reorder task
     * - Active: group, Destination: task -> Reorder group
     * - Active: group, Destination: group -> Reorder group
     *
     *
     */

    setState((prev) => ({ ...prev, activeTask: null }));
  };

  const onDragStart = (event: any) => {
    const { active } = event;

    setState((prev) => ({
      ...prev,
      activeId: active.id,
      activeType: active.data.current?.type || null,
    }));
  };

  const onDragCancel = () => {
    setState((prev) => ({
      ...prev,
      activeId: null,
      activeType: null,
    }));
  };

  const renderDragOverlay = () => {
    if (!activeId) return null;

    if (activeType === "group") {
      const activeGroup = groupList.find((group) => group.id === activeId);
      return activeGroup ? (
        <GroupItem group={activeGroup} activeTask={null} isActive={true} />
      ) : null;
    } else if (activeType === "task") {
      const activeTask = taskList.find((task) => task.id === activeId);
      return activeTask ? (
        <TaskItem
          groupID=""
          task={activeTask}
          onClickShowDetail={() => {}}
          isActive={true}
        />
      ) : null;
    }

    return null;
  };

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      collisionDetection={pointerWithin}
      onDragCancel={onDragCancel}
    >
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
        <SortableContext
          items={groupList.map((group) => String(group.id))}
          strategy={horizontalListSortingStrategy}
        >
          {groupList.map((group, index) => (
            <GroupItem
              key={group.id}
              group={group}
              activeTask={activeId}
              isActive={false}
            />
          ))}
        </SortableContext>
        ;
      </Flex>
      <DragOverlay dropAnimation={dropAnimation}>
        {/* {state.activeTask ? (
          <TaskItem
            groupID={""}
            task={taskList.find((task) => task.id === state.activeTask)}
            onClickShowDetail={() => {}}
            isActive={false}
          />
        ) : null} */}

        {renderDragOverlay()}
      </DragOverlay>
    </DndContext>
  );
};
