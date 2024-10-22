// Libraries
import React, { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDispatch } from 'react-redux';

// Components
import { message } from 'components/ui';
import { TaskItem } from '../TaskItem';
import { TaskDrawer } from '../TaskDetailDrawer';

// Models
import { Task } from 'models';
import { Group } from 'models/Group';

// Utils
import { getContrastTextColor } from 'utils';

// Services
import { deleteTask } from 'services';

// Stores
import { AppDispatch, reorderTaskAsync } from 'store';

interface TaskListProps {
  group: Group;
  taskList: Task[];
  permission: string;
}

type TState = {
  error: string;
  isOpen: boolean;
  selectedTask: Task | undefined;
};

export const TaskList: React.FC<TaskListProps> = props => {
  const { group, taskList, permission } = props;
  const [messageCreate, contextHolder] = message.useMessage();

  // State
  const [state, setState] = useState<TState>({
    error: '',
    isOpen: false,
    selectedTask: undefined,
  });
  const { error, isOpen, selectedTask } = state;

  // Store
  const dispatch: AppDispatch = useDispatch();

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

  const onDeleteTask = async (id: React.Key) => {
    try {
      deleteTask(group.board_id, id);
      dispatch(reorderTaskAsync(group.board_id));
      messageCreate.open({
        type: 'success',
        content: <div>Task deleted!</div>,
      });
    } catch (error) {
      messageCreate.open({
        type: 'error',
        content: error as string,
      });
    }
  };

  const renderTasks = (tasks: Task[]) => {
    return (
      <>
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onClickShowDetail={() => onClickShowTaskDetail(task.id)}
            groupInfo={{
              groupID: group.id,
              groupName: group.name,
              groupColor: group.color,
              textColor: getContrastTextColor(group.color),
            }}
            isOverlay={false}
            onDelete={onDeleteTask}
            permission={permission}
          />
        ))}
      </>
    );
  };

  return (
    <div className="w-[20vw]">
      {contextHolder}
      <SortableContext
        key={group.id}
        id={String(group.id)}
        items={taskList.filter(task => task.status_id === group.id).map(task => String(task.id))}
        strategy={verticalListSortingStrategy}
      >
        <div key={group.id} className="items-center w-full">
          {renderTasks(taskList)}
        </div>
        <div className="text-red-400">{error}</div>
        {selectedTask && (
          <TaskDrawer
            task={selectedTask}
            isOpen={isOpen}
            isClose={onCloseTaskDetail}
            permission={permission}
          />
        )}
      </SortableContext>
    </div>
  );
};
