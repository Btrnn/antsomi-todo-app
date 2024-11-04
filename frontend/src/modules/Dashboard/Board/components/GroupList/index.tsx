// Libraries
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  MouseSensor,
  defaultDropAnimationSideEffects,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { Active, Over } from '@dnd-kit/core/dist/store/index';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

// Icons
import { AddIcon } from 'components/icons';

// Components
import { Button, Flex, Input, message } from 'components/ui';
import { GroupItem } from '../GroupItem';
import { TaskItem } from '../TaskItem';

// Providers
import { AppDispatch, reorderTask, reorderTaskAsync, setGroupList } from 'store';

// Constants
import { PERMISSION, ROLE_KEY } from 'constants/role';
import { SORTABLE_TYPE } from 'constants/tasks';

// Services
import { updateTask as updatedTaskAPI } from 'services/task';

// Models
import { Group, Task } from 'models';

// Utils
import {
  useCreateGroup,
  useDeleteGroup,
  useReorderGroup,
  useReorderTask,
  useUpdateTask,
} from 'queries';
import {
  checkAuthority,
  getContrastTextColor,
  reorderDoubleArrays,
  reorderSingleArray,
} from 'utils';
import { useGroupList, useTaskList } from 'hooks';

interface GroupsProps {
  type: string;
  permission: string;
  boardId: React.Key;
}

type TState = {
  error: string;
  inputGroupName: string;
  activeID: React.Key | null | undefined;
  activeType: string | null | undefined;
  activeInfo: Group | undefined;
  tempGroupList: Group[];
};

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export const GroupList: React.FC<GroupsProps> = props => {
  const { type, boardId, permission } = props;
  const sensors = useSensors(useSensor(MouseSensor));

  const [messageCreate, contextHolder] = message.useMessage();

  // Queries
  const {
    mutateAsync: createGroup,
    isError: isCreateGroupError,
    error: createGroupError,
  } = useCreateGroup({ boardId });
  const { mutateAsync: reorderGroup, isError: isReorderGroupError } = useReorderGroup({ boardId });
  const { mutateAsync: reorderTask, isError: isReorderTaskError } = useReorderTask({ boardId });
  const { mutateAsync: deleteGroup, isError: isDeleteGroupError } = useDeleteGroup({ boardId });
  const { mutateAsync: updateTask, isError: isUpdateTaskError } = useUpdateTask({
    boardId: boardId,
  });

  // State
  const [state, setState] = useState<TState>({
    error: '',
    inputGroupName: '',
    activeID: null,
    activeType: null,
    activeInfo: undefined,
    tempGroupList: [],
  });

  const { activeID, activeType, inputGroupName, activeInfo } = state;

  // Hooks
  const { taskList } = useTaskList(boardId);
  const { groupList, isLoading } = useGroupList(boardId);

  // Effects
  useEffect(() => {
    if (groupList) {
      setState(prev => ({
        ...prev,
        tempGroupList: groupList,
      }));
    }
  }, [groupList]);

  //console.log({ type, permission, boardId });

  // Use Effect
  // useEffect(() => {
  //   // console.log({ groupList });
  // }, [groupList]);

  // Handlers
  const onChangeInputGroup = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, inputGroupName: event.target.value }));
  };

  const onClickAddGroup = async () => {
    const newGroup: Partial<Group> = {
      name: inputGroupName,
      position: state.tempGroupList.length,
      type: type,
      color: '#597ef7',
    };
    createGroup(newGroup);
    if (!isCreateGroupError) {
      messageCreate.open({
        type: 'success',
        content: <div className="z-10">New group added!</div>,
      });
    } else {
      messageCreate.open({
        type: 'error',
        content: createGroupError.message as string,
      });
    }

    setState(prev => ({ ...prev, inputGroupName: '' }));
  };

  const onDragEndReorderTask = (source: Active, destination: Over) => {
    // Find reordered group information
    const reorderedGroup = taskList.filter(task => task.status_id === source.data.current?.groupID);

    // Find source's information
    const sourceIndex = reorderedGroup.findIndex(task => task.id === source.id);

    // Find destination's information
    let destinationIndex;
    if (destination.data.current?.type === SORTABLE_TYPE.GROUP) {
      return;
    } else {
      destinationIndex = reorderedGroup.findIndex(task => task.id === destination.id);
    }

    const reorderedList = reorderSingleArray(reorderedGroup, sourceIndex, destinationIndex);
    for (
      let i = Math.min(sourceIndex, destinationIndex);
      i <= Math.max(sourceIndex, destinationIndex);
      i++
    ) {
      reorderedList[i].position = i;
    }
    const positionList = reorderedList
      .slice(Math.min(sourceIndex, destinationIndex), Math.max(sourceIndex, destinationIndex) + 1)
      .map(task => ({ id: task.id, position: task.position }));

    reorderTask(positionList);
    if (isReorderTaskError) {
      messageCreate.open({
        type: 'error',
        content: 'Reorder task failed!',
      });
    }
    // console.log('🚀 ~ reorderTask ~ reorderedList:', positionList);
  };

  const onDragOverChangeTaskGroup = (source: Active, destination: Over) => {
    // Find source's information
    const sourceList = taskList.filter(task => task.status_id === source.data.current?.groupID);
    const sourceIndex = sourceList.findIndex(task => task.id === source.id);

    // Find destination's information
    let destinationList, destinationIndex;
    if (destination.data.current?.type === SORTABLE_TYPE.GROUP) {
      destinationList = taskList.filter(task => task.status_id === destination.id);
      destinationIndex = 0;
    } else {
      destinationList = taskList.filter(
        task => task.status_id === destination.data.current?.groupID,
      );
      destinationIndex = destinationList.findIndex(task => task.id === destination.id);
    }

    if (destination.data.current?.type === SORTABLE_TYPE.TASK) {
      updateTask({ id: source.id, status_id: destination.data.current?.groupID });
    } else {
      updateTask({ id: source.id, status_id: destination?.id });
    }
    if (isUpdateTaskError) {
      messageCreate.open({
        type: 'error',
        content: 'Reorder task failed!',
      });
    }

    if (sourceIndex === -1) {
      //console.log('🚀 ~ onDragOverChangeTaskGroup ~ sourceList:', sourceList);
      return;
    }

    // Reorder 2 lists
    let [reorderedSourceList, reorderedDestinationList] = reorderDoubleArrays(
      sourceList,
      destinationList,
      sourceIndex,
      destinationIndex,
    );
    for (let i = sourceIndex; i < reorderedSourceList.length; i++) {
      reorderedSourceList[i].position = i;
    }

    for (let i = destinationIndex; i < reorderedDestinationList.length; i++) {
      reorderedDestinationList[i].position = i;
    }

    // Get the list of positions to be changed.
    reorderedSourceList = reorderedSourceList.slice(sourceIndex).map(task => ({
      id: task.id,
      position: task.position,
    }));

    reorderedDestinationList = reorderedDestinationList.slice(destinationIndex).map(task => ({
      id: task.id,
      position: task.position,
    }));

    reorderTask([...reorderedSourceList, ...reorderedDestinationList]);
    if (isReorderTaskError) {
      messageCreate.open({
        type: 'error',
        content: 'Reorder task failed!',
      });
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    let currentInfo;
    if (event.active.data.current?.type === SORTABLE_TYPE.TASK) {
      currentInfo = state.tempGroupList.find(
        group => group.id === event.active.data.current?.groupID,
      );
    }
    setState(prev => ({
      ...prev,
      activeID: event.active?.id,
      activeType: event.active.data.current?.type,
      tempTaskList: taskList,
      activeInfo: currentInfo,
    }));
  };

  const onDragCancel = () => {
    setState(prev => ({
      ...prev,
      activeID: null,
      activeType: null,
      tempTaskList: [],
    }));
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }

    let destinationGroup;

    if (active.data.current?.type === SORTABLE_TYPE.TASK) {
      // if (destination?.type === SORTABLE_TYPE.TASK) {
      //   if (destination?.groupID !== source?.groupID) {
      //     updateTask({ id: active.id, status_id: destination?.groupID });
      //   }
      // } else {
      //   updateTask({ id: active.id, status_id: over?.id });
      // }

      if (over.data.current?.type === SORTABLE_TYPE.GROUP) {
        destinationGroup = over.id;
      } else {
        destinationGroup = over.data.current?.groupID;
      }

      if (active.data.current?.groupID !== destinationGroup) {
        onDragOverChangeTaskGroup(active, over);
      }

      //dispatch(reorderTask({ source: active, destination: over }));
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const sourceType = active.data.current?.type;

    if (!over) {
      return;
    }

    if (sourceType === SORTABLE_TYPE.GROUP) {
      const destinationIndex = state.tempGroupList.findIndex(group => group.id === over.id);
      const sourceIndex = state.tempGroupList.findIndex(group => group.id === active.id);
      const reorderedList = reorderSingleArray(state.tempGroupList, sourceIndex, destinationIndex);
      let positionList = reorderedList.map(group => ({
        id: group.id,
        position: group.position,
      }));

      for (
        let i = Math.min(sourceIndex, destinationIndex);
        i <= Math.max(sourceIndex, destinationIndex);
        i++
      ) {
        positionList[i].position = i;
      }

      positionList = positionList.slice(
        Math.min(sourceIndex, destinationIndex),
        Math.max(sourceIndex, destinationIndex) + 1,
      );

      setState(prev => ({
        ...prev,
        tempGroupList: reorderedList,
      }));

      reorderGroup(positionList);
    } else {
      onDragEndReorderTask(active, over);
    }
    // setState(prev => ({
    //   ...prev,
    //   activeID: null,
    //   activeType: null,
    //   tempTaskList: [],
    //   activeInfo: undefined,
    // }));
  };

  const onDeleteGroup = async (id: React.Key) => {
    deleteGroup(id);
    const updatePosition = state.tempGroupList.find(group => group.id === id)?.position;
    const positionList = state.tempGroupList
      .filter(group => group.id !== id)
      .map(group => ({
        id: group.id,
        position: group.position,
      }));
    if (updatePosition) {
      for (let i = updatePosition; i < positionList.length; i++) {
        positionList[i].position = i;
      }
    }
    const updatePositionList = positionList.slice(updatePosition);
    reorderGroup(updatePositionList);

    if (!isDeleteGroupError) {
      messageCreate.open({
        type: 'success',
        content: <div>Group deleted!</div>,
      });
    } else {
      messageCreate.open({
        type: 'error',
        content: 'Cannot delete group!',
      });
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
      {contextHolder}
      <Flex justify="flex-start" align={'flex-start'} className="gap-5 w-full h-full">
        <SortableContext
          items={state.tempGroupList.map(group => String(group.id))}
          strategy={horizontalListSortingStrategy}
        >
          {state.tempGroupList?.map(group => (
            <GroupItem
              key={group.id}
              group={group}
              allTasks={taskList}
              onDelete={onDeleteGroup}
              isOverlay={false}
              isRearrange={activeID !== null}
              boardId={boardId}
              permission={permission}
            />
          ))}
        </SortableContext>
        {checkAuthority(permission, PERMISSION[ROLE_KEY.EDITOR]) && (
          <div className="flex gap-1 flex-shrink-0 w-[280px]">
            <Input
              className="p-2"
              style={{
                outline: 'none',
                boxShadow: 'none',
              }}
              placeholder="Add new group"
              value={inputGroupName}
              onChange={onChangeInputGroup}
              onPressEnter={onClickAddGroup}
            />
            <Button className="w-10 h-10" onClick={onClickAddGroup}>
              <AddIcon />
            </Button>
          </div>
        )}
      </Flex>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeID ? (
          activeType === SORTABLE_TYPE.TASK ? (
            activeInfo && (
              <TaskItem
                task={taskList.find(task => task.id === activeID)}
                groupInfo={{
                  groupColor: activeInfo.color,
                  groupID: activeInfo.id,
                  groupName: activeInfo.name,
                  textColor: getContrastTextColor(activeInfo.color),
                }}
                isOverlay={true}
                onDelete={async () => {}}
                permission={permission}
              />
            )
          ) : (
            <GroupItem
              group={state.tempGroupList.find(group => group.id === activeID)}
              allTasks={taskList}
              onDelete={async () => {}}
              isOverlay={true}
              isRearrange={false}
              boardId={''}
              permission={permission}
            />
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
