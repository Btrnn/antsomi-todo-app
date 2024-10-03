// Libraries
import React, { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Components
import { TaskItem } from '../TaskItem';
import { TaskDetail } from '../TaskDetailDrawer';

// Models
import { Task } from 'models';
import { Group } from 'models/Group';

interface TaskListProps {
  groupInfo: Group;
  taskList: Task[];
}

type TState = {
  error: string;
  isOpen: boolean;
  selectedTask: Task | undefined;
};

export const TaskList: React.FC<TaskListProps> = props => {
  const { groupInfo, taskList } = props;

  // State
  const [state, setState] = useState<TState>({
    error: '',
    isOpen: false,
    selectedTask: undefined,
  });
  const { error, isOpen, selectedTask } = state;

  // Handlers
  const onClickShowTaskDetail = (taskID: React.Key) => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      selectedTask: taskList.find(task => task.id === taskID),
    }));
  };

  const onCloseTaskDetail = () => {
    setState(prev => ({ ...prev, isOpen: false, selectedTask: undefined }));
  };

  const renderTasks = (tasks: Task[]) => {
    const filteredTasks = tasks.filter(task => task.status_id === groupInfo.id);

    return (
      <>
        {filteredTasks.map(task => (
          <TaskItem
            key={task.id}
            groupID={groupInfo.id}
            task={task}
            onClickShowDetail={() => onClickShowTaskDetail(task.id)}
          />
        ))}
      </>
    );
  };

  return (
    <>
      <style>
        {`
        .custom-scroll {
          overflow-y: hidden; 
          padding-right: 10px;
        }
        
        .custom-scroll:hover {
          overflow-y: auto; 
        }
        
        .custom-scroll::-webkit-scrollbar {
          width: 2px; 
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

      <div className="flex-shrink-0 w-[20vw] h-[63vh] custom-scroll">
        <SortableContext
          key={groupInfo.id}
          id={String(groupInfo.id)}
          items={taskList
            .filter(task => task.status_id === groupInfo.id)
            .map(task => String(task.id))}
          strategy={verticalListSortingStrategy}
        >
          <div key={groupInfo.id} className="items-center overflow-hidden">
            {renderTasks(taskList)}
          </div>
          <div className="text-red-400">{error}</div>
          {selectedTask && (
            <TaskDetail task={selectedTask} isOpen={isOpen} isClose={onCloseTaskDetail} />
          )}
        </SortableContext>
      </div>
    </>
  );
};
