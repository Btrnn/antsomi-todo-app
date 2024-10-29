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
import React, { useEffect, useState } from 'react';
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
import { useGroupList, useTaskList } from 'hooks';
import { useCreateGroup, useDeleteGroup, useReorderGroup, useUpdateTask } from 'queries';
import { checkAuthority, getContrastTextColor, reorderSingleArray } from 'utils';

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
  tempTaskList: Task[];
  activeInfo: Group | undefined;
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
  //const { mutateAsync: updateTask } = useUpdateTask({ boardId });
  const {
    mutateAsync: reorderGroup,
    isError: isReorderGroupError,
    //error: reorderGroupError,
  } = useReorderGroup({ boardId });
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
    tempTaskList: [],
    activeInfo: undefined,
  });

  const { activeID, activeType, inputGroupName, tempTaskList, activeInfo } = state;

  // Store
  const dispatch: AppDispatch = useDispatch();

  // Hooks
  const { taskList } = useTaskList(boardId);
  const { groupList } = useGroupList(boardId);

  // Use Effect
  useEffect(() => {}, [boardId]);

  useEffect(() => {
    // console.log({ groupList });
  }, [groupList]);

  // Handlers

  const onChangeInputGroup = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, inputGroupName: event.target.value }));
  };

  const onClickAddGroup = async () => {
    const newGroup: Partial<Group> = {
      name: inputGroupName,
      position: groupList.length,
      type: type,
      color: '#597ef7',
      board_id: boardId,
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

  const reorderTask = (source: Active, destination: Over) => {
    // console.log('🚀 ~ reorderTask ~ destination:', destination);
    // console.log('🚀 ~ reorderTask ~ source:', source);
  };

  const onDragStart = (event: DragStartEvent) => {
    let currentInfo;
    if (event.active.data.current?.type === SORTABLE_TYPE.TASK) {
      currentInfo = groupList.find(group => group.id === event.active.data.current?.groupID);
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
    // console.log('🚀 ~ onDragOver ~ over:', over);
    // console.log('🚀 ~ onDragOver ~ active:', active);
    if (!over) {
      return;
    }

    const source = active.data.current;
    const destination = over.data.current;

    if (source?.type === SORTABLE_TYPE.TASK) {
      if (destination?.type === SORTABLE_TYPE.TASK) {
        // console.log('task');

        if (destination?.groupID !== source?.groupID) {
          updateTask({ id: active.id, status_id: destination?.groupID });
        }
      } else {
        // console.log('group');
        updateTask({ id: active.id, status_id: over?.id });
      }
      //dispatch(reorderTask({ source: active, destination: over }));
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    // console.log('🚀 ~ onDragEnd ~ over:', over);
    // console.log('🚀 ~ onDragEnd ~ active:', active);
    const sourceType = active.data.current?.type;

    if (!over) {
      return;
    }

    // if (sourceType === SORTABLE_TYPE.TASK) {
    //   reorderTask(active, over);
    //   // dispatch(reorderTask({ source: active, destination: over }));
    //   // try {
    //   //   if (over.data.current?.type === SORTABLE_TYPE.GROUP) {
    //   //     updatedTaskAPI(boardId, { id: active.id, status_id: over.id });
    //   //   } else {
    //   //     updatedTaskAPI(boardId, {
    //   //       id: active.id,
    //   //       status_id: over.data.current?.groupID,
    //   //     });
    //   //   }
    //   //   dispatch(reorderTaskAsync(boardId));
    //   // } catch (error) {
    //   //   messageCreate.open({
    //   //     type: 'error',
    //   //     content: error as string,
    //   //   });
    //   // }
    // }

    if (sourceType === SORTABLE_TYPE.GROUP) {
      const destinationIndex = groupList.findIndex(group => group.id === over.id);
      const sourceIndex = groupList.findIndex(group => group.id === active.id);
      const reorderedList = reorderSingleArray(groupList, sourceIndex, destinationIndex);
      const positionList = reorderedList.map(group => ({
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
      reorderGroup(positionList);
    } else {
      reorderTask(active, over);
    }
    setState(prev => ({
      ...prev,
      activeID: null,
      activeType: null,
      tempTaskList: [],
      activeInfo: undefined,
    }));
  };

  const onDeleteGroup = async (id: React.Key) => {
    deleteGroup(id);
    const updatePosition = groupList.find(group => group.id === id)?.position;
    const positionList = groupList
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

    if (!isDeleteGroupError && !isReorderGroupError) {
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

  // console.log('group 2:: ', groupList);

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
          items={groupList.map(group => String(group.id))}
          strategy={horizontalListSortingStrategy}
        >
          {groupList?.map(group => (
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
              group={groupList.find(group => group.id === activeID)}
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
