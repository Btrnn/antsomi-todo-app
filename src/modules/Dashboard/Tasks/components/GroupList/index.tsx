// Libraries
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  rectIntersection,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';

// Icons
import { AddIcon } from 'components/icons';

// Components
import { Button, Input, Flex } from 'components/ui';

// Providers
import { RootState, AppDispatch, addGroup, reorderTask, reorderGroup } from 'store';

//
import { TaskItem } from '../TaskItem';
import { GroupItem } from '../GroupItem';

import { defaultDropAnimationSideEffects, DropAnimation } from 'components/ui/DragDrop';

// Constants
import { SORTABLE_TYPE } from 'constants/tasks';

interface GroupsProps {
  id: React.Key;
  groupTitle: string;
  type: string;
}

type TState = {
  groupType: string;
  error: string;
  inputGroupName: string;
  activeID: React.Key | null | undefined;
  activeType: string | null | undefined;
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

export const Groups: React.FC<GroupsProps> = props => {
  const { groupTitle, type } = props;
  const sensors = useSensors(useSensor(MouseSensor));

  // State
  const [state, setState] = useState<TState>({
    groupType: groupTitle,
    error: '',
    inputGroupName: '',
    activeID: null,
    activeType: null,
  });

  const { activeID, activeType, inputGroupName } = state;

  // Store
  const dispatch: AppDispatch = useDispatch();
  const groupList = useSelector((state: RootState) => state.group.groupList);
  const taskList = useSelector((state: RootState) => state.task.taskList);

  // Handlers
  const onChangeInputGroup = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, inputGroupName: event.target.value }));
  };

  const onClickAddGroup = () => {
    const newGroup = { name: inputGroupName, type: type };
    dispatch(addGroup(newGroup));
    setState(prev => ({ ...prev, inputGroupName: '' }));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const sourceType = active.data.current?.type;

    if (!over) {
      return;
    }

    if (sourceType === SORTABLE_TYPE.TASK) {
      dispatch(reorderTask({ source: active, destination: over }));
    } else if (sourceType === SORTABLE_TYPE.GROUP) {
      const destinationIndex = groupList.findIndex(group => group.id === over.id);

      dispatch(
        reorderGroup({
          source: active,
          destinationIndex,
        }),
      );
    }

    setState(prev => ({ ...prev, activeID: null, activeType: null }));
  };

  const onDragStart = (event: DragStartEvent) => {
    setState(prev => ({
      ...prev,
      activeID: event.active?.id,
      activeType: event.active.data.current?.type,
    }));
  };

  const onDragCancel = () => {
    setState(prev => ({
      ...prev,
      activeID: null,
      activeType: null,
      tempGroupList: [],
    }));
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const source = active.data.current;

    if (source?.type === 'task') {
      dispatch(reorderTask({ source: active, destination: over }));
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
        align={'flex-start'}
        className="gap-5 overflow-x-auto flex-shrink-0 w-full h-[75vh]"
      >
        <div className="flex gap-1 mt-11 flex-shrink-0 w-1/5">
          <Input
            className="p-2"
            placeholder="Add new group"
            value={inputGroupName}
            onChange={onChangeInputGroup}
            onPressEnter={onClickAddGroup}
          />
          <Button className="w-9 h-9" onClick={onClickAddGroup}>
            <AddIcon />
          </Button>
        </div>
        <SortableContext
          items={groupList.map(group => String(group.id))}
          strategy={horizontalListSortingStrategy}
        >
          {groupList?.map(group => <GroupItem key={group.id} group={group} taskList={taskList} />)}
        </SortableContext>
      </Flex>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeID ? (
          activeType === 'task' ? (
            <TaskItem
              groupID={''}
              task={taskList.find(task => task.id === activeID)}
              onClickShowDetail={() => {}}
            />
          ) : (
            <GroupItem group={groupList.find(group => group.id === activeID)} taskList={taskList} />
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
