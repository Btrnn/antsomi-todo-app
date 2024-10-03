// Libraries
import React, { useState, useEffect } from 'react';
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
  DropAnimation,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';

// Icons
import { AddIcon } from 'components/icons';

// Components
import { Button, Input, Flex } from 'components/ui';
import { TaskItem } from '../TaskItem';
import { GroupItem } from '../GroupItem';

// Providers
import { RootState, AppDispatch, addGroup, reorderTask, reorderGroup, setGroupList, deleteGroup, moveTask } from 'store';

// Constants
import { SORTABLE_TYPE } from 'constants/tasks';

// Services
import { getAllGroups, createGroup, deleteGroup as deleteGroupAPI, reorderGroup as reorderGroupAPI} from 'services/group';
import { reorderTask as reorderTaskAPI, updateTask as updatedTaskAPI } from 'services/task';

// Models
import { Group } from 'models';
import { Task } from 'models';

interface GroupsProps {
  id: React.Key;
  type: string;
}

type TState = {
  error: string;
  inputGroupName: string;
  activeID: React.Key | null | undefined;
  activeType: string | null | undefined;
  tempTaskList: Task[];
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
  const { type } = props;
  const sensors = useSensors(useSensor(MouseSensor));

  // State
  const [state, setState] = useState<TState>({
    error: '',
    inputGroupName: '',
    activeID: null,
    activeType: null,
    tempTaskList: [],
  });

  const { activeID, activeType, inputGroupName, tempTaskList } = state;

  // Store
  const dispatch: AppDispatch = useDispatch();
  const groupList = useSelector((state: RootState) => state.group.groupList);
  const taskList = useSelector((state: RootState) => state.task.taskList);

  // Handlers
  const getGroupList = async () => {
    try {
      const fetchedGroups = await getAllGroups(); 
      dispatch(setGroupList(fetchedGroups?.data));
    } catch (error) {
      console.log(error);
    }
  };

  const onChangeInputGroup = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, inputGroupName: event.target.value }));
  };

  const onClickAddGroup = async () => {
    const newGroup: Partial<Group> = { name: inputGroupName, position: groupList.length , type: type, color: '#597ef7' };
    const createdGroup = await createGroup(newGroup);
    getGroupList();
    setState(prev => ({ ...prev, inputGroupName: '' }));
  };

  const onDragStart = (event: DragStartEvent) => {
    setState(prev => ({
      ...prev,
      activeID: event.active?.id,
      activeType: event.active.data.current?.type,
      tempTaskList: taskList,
    }));
  };

  const onDragCancel = () => {
    setState(prev => ({
      ...prev,
      activeID: null,
      activeType: null,
      tempTaskList: []
    }));
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const source = active.data.current;

    if (source?.type === SORTABLE_TYPE.TASK) {
      dispatch(moveTask({ source: active, destination: over }));
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const sourceType = active.data.current?.type;

    if (!over) {
      return;
    }

    if (sourceType === SORTABLE_TYPE.TASK) {
      dispatch(reorderTask({ source: active, destination: over }));
      if(over.data.current?.type ===  SORTABLE_TYPE.GROUP){
        updatedTaskAPI(active.id, {status_id: over.id});
      }
      else{
        updatedTaskAPI(active.id, {status_id: over.data.current?.groupID});
      }
    } else if (sourceType === SORTABLE_TYPE.GROUP) {
      dispatch(reorderGroup({ source: active, destination: over }));
    }
    setState(prev => ({ ...prev, activeID: null, activeType: null, tempTaskList: [] }));
  };

  

  const onDeleteGroup = async (id: React.Key) =>{
    //dispatch(deleteGroup(id))
    const deletedGroup = await deleteGroupAPI(id);
    getGroupList();
  }

  // Use Effect
  useEffect(() => {
    getGroupList();
  }, []);

  useEffect(() => {
    const groupPositions = groupList.map(group => ({
      id: group.id,
      position: group.position,
    }));
    const reorder = async () => {
      try {
        await reorderGroupAPI(groupPositions);
      } catch (error) {
        console.error("Error reordering groups:", error);
      }
    };
    reorder();
  }, [groupList]);

  useEffect(() => {
    if (activeID === null){
      const taskPositions = taskList.map(task => ({
      id: task.id,
      position: task.position,
    }));

    const reorder = async () => {
      try {
        await reorderTaskAPI(taskPositions);
      } catch (error) {
        console.error("Error reordering groups:", error);
      }
    };
    reorder();
    }
  }, [taskList]);

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      collisionDetection={rectIntersection}
      onDragCancel={onDragCancel}
      onDragOver={onDragOver}
    >
      <style>
        {`
        .custom-scroll {
          overflow-x: hidden;
          position: relative; 
        }
        
        .custom-scroll:hover {
          overflow-x: auto; 
        }
        
        .custom-scroll::-webkit-scrollbar {
          height: 5px; 
          position: absolute;
          right: 0;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: #bfbfbf; 
          border-radius: 4px; 
        }

        .custom-scroll::-webkit-scrollbar-track {
          background: transparent; 
        }
      `}
      </style>
      <Flex
        justify="space-evenly"
        align={'flex-start'}
        className="gap-5 flex-shrink-0 w-full h-full overflow-auto custom-scroll"
      >
        <SortableContext
          items={groupList.map(group => String(group.id))}
          strategy={horizontalListSortingStrategy}
        >
          {groupList?.map(group => <GroupItem key={group.id} group={group} taskList={taskList} onDelete={onDeleteGroup} />)}
        </SortableContext>
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
          <Button className="w-9 h-9" onClick={onClickAddGroup}>
            <AddIcon />
          </Button>
        </div>
      </Flex>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeID ? (
          activeType === SORTABLE_TYPE.TASK ? (
            <TaskItem
              groupID={''}
              task={taskList.find(task => task.id === activeID)}
              onClickShowDetail={() => {}}
            />
          ) : (
            <GroupItem group={groupList.find(group => group.id === activeID)} taskList={taskList} onDelete={onDeleteGroup}/>
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
