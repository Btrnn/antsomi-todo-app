// Libraries
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  closestCenter,
  closestCorners,
  rectIntersection,
  pointerWithin,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

// Icons
import { AddIcon } from "components/icons";

// Components
import { Button, Input, Flex } from "components/ui";

// Providers
import {
  RootState,
  AppDispatch,
  addGroup,
  reorderTask,
  reorderGroup,
} from "store";

// Models
import { Task } from "models";
import { Group } from "models";

//
import { TaskItem } from "../TaskItem";
import { GroupItem } from "../GroupItem";

import {
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "components/ui/DragDrop";

// Utils
import { reorderSingleArray } from "utils";
import { reorderDoubleArrays } from "utils";

// Constants
import { SORTABLE_TYPE } from "constants/tasks";

interface GroupsProps {
  id: any;
  groupTitle: string;
  type: string;
}

type TState = {
  groupType: string;
  error: string;
  inputGroupName: string;
  confirmDelete: boolean;
  isRenaming: boolean;
  groupSelected: string;
  groupNewName: string;
  activeID: string | null;
  activeType: string | null;
  destinationIndex: number;
  destinationGroup: string;
  tempGroupList: Group[];
};

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
  const { groupTitle, type } = props;
  const sensors = useSensors(useSensor(MouseSensor));

  // State
  const [state, setState] = useState<TState>({
    groupType: groupTitle,
    error: "",
    inputGroupName: "",
    confirmDelete: false,
    isRenaming: false,
    groupSelected: "",
    groupNewName: "",
    activeID: null,
    activeType: null,
    destinationIndex: -1,
    destinationGroup: "",
    tempGroupList: [],
  });
  const [tempTaskList, setTempTaskList] = useState<Task[]>([]);
  // const [tempGroupList, setTempGroupList] = useState<Group[]>([]);

  // Varaiables
  const { tempGroupList, activeID, activeType } = state;

  // Store
  const dispatch: AppDispatch = useDispatch();
  const groupList = useSelector((state: RootState) => state.group.groupList);
  const taskList = useSelector((state: RootState) => state.task.taskList);

  // Handlers
  const onChangeInputGroup = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, inputGroupName: event.target.value }));
  };

  const onClickAddGroup = () => {
    const newGroup = { name: state.inputGroupName, type: type };
    dispatch(addGroup(newGroup));
    setState((prev) => ({ ...prev, inputGroupName: "" }));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;
    const sourceType = active.data.current?.type;

    if (sourceType === SORTABLE_TYPE.TASK) {
      dispatch(reorderTask({ source: active, destination: over }));
      setTempTaskList([]);
    } else if (sourceType === "group") {
      dispatch(
        reorderGroup({
          source: active,
          destinationIndex: state.destinationIndex,
        })
      );
      // setTempGroupList([]);
      setState((prev) => ({
        ...prev,
        tempGroupList: [],
        destinationIndex: -1,
      }));
    }

    setState((prev) => ({ ...prev, activeID: null, activeType: null }));
  };

  const onDragStart = (event: any) => {
    setState((prev) => ({
      ...prev,
      activeID: event.active.id,
      activeType: event.active.data.current.type,
    }));

    if (event.active.data.current.type === "task") setTempTaskList(taskList);
    else
      setState((prev) => ({
        ...prev,
        tempGroupList: groupList,
      }));
  };

  const onDragCancel = () => {
    setState((prev) => ({
      ...prev,
      activeID: null,
      activeType: null,
      tempGroupList: [],
    }));
    setTempTaskList([]);
  };

  const onDragOver = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const source = active.data.current;
    //const destination = over.data.current;

    if (source.type === "task") {
      // if(destination.type === "group"){
      //   setTempTaskList((prevTaskList) =>
      //     prevTaskList.map((task) =>
      //       task.id === active.id ? { ...task, status_id: over.id } : task
      //     )
      //   );
      //   setState((prev) => ({
      //     ...prev,
      //     destinationIndex: 0,
      //     destinationGroup: destination.groupID,
      //   }));
      // }
      // else{
      //   if(source.groupID === destination.groupID){
      //     setState((prev) => ({
      //       ...prev,
      //       destinationIndex: tempTaskList.findIndex(task => task.id === over.id),
      //       destinationGroup: destination.groupID,
      //     }));
      //   }
      //   else{
      //     setState((prev) => ({
      //       ...prev,
      //       destinationIndex: tempTaskList.findIndex(task => task.id === over.id),
      //       destinationGroup: destination.groupID,
      //     }));

      //     setTempTaskList((prevTaskList) => {
      //       const activeTask = prevTaskList.find((task) => String(task.id) === active.id);
      //       if (!activeTask) return prevTaskList;
      //       activeTask.status_id = destination.groupID;
      //       const sourceList = prevTaskList.filter((task) => task.status_id === source.groupID && task.id !== active.id);
      //       const sourceIndex = sourceList.findIndex((task) => task.id === active.id);

      //       const destinationList = prevTaskList.filter((task) => task.status_id === destination.groupID);
      //       const destinationIndex = destinationList.findIndex((task) => task.id === over.id);

      //       return [
      //         ...sourceList,
      //         ...reorderDoubleArrays(sourceList, destinationList, sourceIndex, destinationIndex),
      //       ];
      //     })}}

      dispatch(reorderTask({ source: active, destination: over }));
    } else {
      const sourceIndex = tempGroupList.findIndex(
        (group) => group.id === active.id
      );
      let destinationIndex = -1;
      if (over.data.current.type === "group")
        destinationIndex = tempGroupList.findIndex(
          (group) => group.id === over.id
        );
      else
        destinationIndex = tempGroupList.findIndex(
          (group) => group.id === over.data.current.groupID
        );

      setState((prev) => ({
        ...prev,
        destinationIndex: destinationIndex,
        tempGroupList: reorderSingleArray(
          tempGroupList,
          sourceIndex,
          destinationIndex
        ),
      }));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      collisionDetection={rectIntersection}
      onDragCancel={onDragCancel}
      onDragOver={onDragOver}
    >
      <Flex
        justify="space-between"
        align={"flex-start"}
        className="gap-5 overflow-x-auto flex-shrink-0 w-full h-[75vh]"
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
          items={tempGroupList.map((group) => String(group.id))}
          strategy={horizontalListSortingStrategy}
        >
          {(tempGroupList.length === 0 ? groupList : tempGroupList).map(
            (group) => (
              <GroupItem key={group.id} group={group} taskList={taskList} />
            )
          )}
        </SortableContext>
      </Flex>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeID ? (
          activeType === "task" ? (
            <TaskItem
              groupID={""}
              task={taskList.find((task) => task.id === activeID)}
              onClickShowDetail={() => {}}
            />
          ) : (
            <GroupItem
              group={groupList.find((group) => group.id === activeID)}
              taskList={taskList}
            />
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
