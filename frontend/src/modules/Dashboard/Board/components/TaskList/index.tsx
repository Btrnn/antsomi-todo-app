// Libraries
import React, { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDispatch } from 'react-redux';

// Components
import { message } from 'components/ui';
import { TaskItem } from '../TaskItem';

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

export const TaskList: React.FC<TaskListProps> = props => {
  const { group, taskList, permission } = props;
  const [messageCreate, contextHolder] = message.useMessage();

  // Store
  const dispatch: AppDispatch = useDispatch();

  // Handlers
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
      </SortableContext>
    </div>
  );
};
