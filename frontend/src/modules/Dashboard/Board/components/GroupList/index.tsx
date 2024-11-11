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
  tempTaskList: Task[];
  startIndex: number | undefined;
  startGroup: React.Key | undefined;
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
  const { mutateAsync: reorderGroup } = useReorderGroup({ boardId });
  const { mutateAsync: reorderTask } = useReorderTask({ boardId });
  const { mutateAsync: deleteGroup, isError: isDeleteGroupError } = useDeleteGroup({ boardId });
  const { mutateAsync: updateTask } = useUpdateTask({
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
    tempTaskList: [],
    startIndex: undefined,
    startGroup: undefined,
  });

  const {
    activeID,
    activeType,
    inputGroupName,
    activeInfo,
    tempTaskList,
    tempGroupList,
    startIndex,
    startGroup,
  } = state;

  // Hooks
  const { taskList } = useTaskList(boardId);
  const { groupList } = useGroupList(boardId);

  // Effects
  useEffect(() => {
    if (groupList) {
      setState(prev => ({
        ...prev,
        tempGroupList: groupList,
      }));
    }
  }, [groupList]);

  useEffect(() => {
    if (taskList) {
      setState(prev => ({
        ...prev,
        tempTaskList: taskList,
      }));
    }
  }, [taskList]);

  // Handlers
  const onChangeInputGroup = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, inputGroupName: event.target.value }));
  };

  const onClickAddGroup = async () => {
    const newGroup: Partial<Group> = {
      name: inputGroupName,
      position: tempGroupList.length,
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

  const onDragEndReorderTask = (endIndex: number, endGroup: number) => {
    if (!startGroup || !endGroup) {
      return;
    }

    // Find source's information
    const sourceList = tempTaskList.filter(task => task.status_id === startGroup);
    const destinationList = tempTaskList.filter(task => task.status_id === endGroup);

    let positionList, reorderedList, remainingList;
    if (startGroup === endGroup) {
      remainingList = tempTaskList.filter(task => task.status_id !== startGroup);

      reorderedList = reorderSingleArray(sourceList, startIndex ?? 0, endIndex);
      for (
        let i = Math.min(startIndex ?? 0, endIndex);
        i <= Math.max(startIndex ?? 0, endIndex);
        i++
      ) {
        reorderedList[i].position = i;
      }
      positionList = reorderedList
        .map(task => ({ id: task.id, position: task.position }))
        .slice(Math.min(startIndex ?? 0, endIndex), Math.max(startIndex ?? 0, endIndex) + 1);

      setState(prev => ({ ...prev, tempTaskList: [...remainingList, ...reorderedList] }));
      reorderTask(positionList);
    } else {
      // Get unchanged tasks list
      remainingList = tempTaskList.filter(
        task => task.status_id !== endGroup && task.status_id !== startGroup,
      );

      // Get reordered sourceList
      for (let i = startIndex ?? 0; i < sourceList.length; i++) {
        sourceList[i].position = i;
      }
      const sourcePositionList = sourceList
        .map(task => ({ id: task.id, position: task.position }))
        .splice(startIndex ?? 0);

      // Get reordered destinationList
      const currentIndex = destinationList.findIndex(task => task.id === activeID);
      const [task] = destinationList.splice(currentIndex, 1);
      destinationList.splice(endIndex, 0, task);

      for (let i = endIndex; i < destinationList.length; i++) {
        destinationList[i].position = i;
      }
      const destinationPositionList = destinationList
        .map(task => ({
          id: task.id,
          position: task.position,
        }))
        .splice(endIndex);

      setState(prev => ({
        ...prev,
        tempTaskList: [...remainingList, ...destinationList, ...sourceList],
      }));
      reorderTask([...sourcePositionList, ...destinationPositionList]);
      updateTask({ id: activeID ?? '', status_id: endGroup });
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    let currentInfo,
      sourceGroup = undefined;

    if (event.active.data.current?.type === SORTABLE_TYPE.TASK) {
      currentInfo = tempGroupList.find(group => group.id === event.active.data.current?.groupID);
      sourceGroup = active.data.current?.sortable?.containerId;
    }

    setState(prev => ({
      ...prev,
      activeID: event.active?.id,
      activeType: event.active.data.current?.type,
      activeInfo: currentInfo,
      startIndex: active.data.current?.sortable?.index,
      startGroup: sourceGroup,
    }));
  };

  const onDragCancel = () => {
    setState(prev => ({
      ...prev,
      activeID: null,
      activeType: null,
    }));
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }

    let destinationGroup, destinationIndex;

    if (active.data.current?.type === SORTABLE_TYPE.TASK) {
      if (over.data.current?.type === SORTABLE_TYPE.GROUP) {
        destinationGroup = over.id;
        destinationIndex = 0;
      } else {
        destinationGroup = over.data.current?.groupID;
        destinationIndex = over.data.current?.sortable?.index;
      }

      const sourceGroup = tempTaskList.find(task => task.id === active.id)?.status_id;

      if (sourceGroup !== destinationGroup) {
        setState(prev => ({
          ...prev,
          activeInfo: prev.activeInfo
            ? {
                ...prev.activeInfo,
                id: destinationGroup,
              }
            : undefined,
          tempTaskList: prev.tempTaskList.map(task => ({
            ...task,
            status_id: task.id === active.id ? destinationGroup : task.status_id,
            position: task.id === active.id ? destinationIndex : task.position,
          })),
        }));
      }

      //dispatch(reorderTask({ source: active, destination: over }));
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const sourceType = active.data.current?.type;
    const destinationType = over?.data.current?.type;

    if (!over) {
      return;
    }

    const endIndex = over.data.current?.sortable?.index;

    if (startIndex !== undefined && endIndex !== undefined) {
      if (sourceType === SORTABLE_TYPE.GROUP) {
        const reorderedList = reorderSingleArray(tempGroupList, startIndex, endIndex);
        let positionList = reorderedList.map(group => ({
          id: group.id,
          position: group.position,
        }));

        for (let i = Math.min(startIndex, endIndex); i <= Math.max(startIndex, endIndex); i++) {
          positionList[i].position = i;
        }

        positionList = positionList.slice(
          Math.min(startIndex, endIndex),
          Math.max(startIndex, endIndex) + 1,
        );

        setState(prev => ({
          ...prev,
          tempGroupList: reorderedList,
        }));

        reorderGroup(positionList);
      } else {
        let endGroup;
        if (destinationType === SORTABLE_TYPE.TASK) {
          endGroup = over.data.current?.sortable?.containerId;
        } else {
          endGroup = over.id;
        }
        onDragEndReorderTask(endIndex, endGroup);
      }
    }
    setState(prev => ({
      ...prev,
      activeID: null,
      activeType: null,
      //tempTaskList: [],
      activeInfo: undefined,
    }));
  };

  const onDeleteGroup = async (id: React.Key) => {
    deleteGroup(id);
    const updatePosition = tempGroupList.find(group => group.id === id)?.position;
    const positionList = tempGroupList
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
          items={tempGroupList.map(group => String(group.id))}
          strategy={horizontalListSortingStrategy}
        >
          {tempGroupList?.map(group => (
            <GroupItem
              key={group.id}
              group={group}
              allTasks={tempTaskList}
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
                task={tempTaskList.find(task => task.id === activeID)}
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
              group={tempGroupList.find(group => group.id === activeID)}
              allTasks={tempTaskList}
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
