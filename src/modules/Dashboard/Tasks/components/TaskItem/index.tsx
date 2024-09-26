// Libraries
import { useSelector, useDispatch } from 'react-redux';
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

//Providers
import { RootState, AppDispatch, deleteTaskByID } from 'store';

// Icons
import { DeleteIcon, EditIcon } from 'components/icons';

// Components
import { Popconfirm, Tag, Dropdown, type MenuProps, type MenuInfo, Card } from 'components/ui';

// Models
import { Task } from 'models';

// Constants
import { SORTABLE_TYPE, MENU_KEY } from 'constants/tasks';

interface TaskItemProp {
  groupID: React.Key;
  task: Task | undefined;
  onClickShowDetail: (taskIndex: React.Key) => void;
}

type TState = {
  timeoutId: string | number | NodeJS.Timeout | undefined | null;
};

export const TaskItem: React.FC<TaskItemProp> = props => {
  const { groupID, task, onClickShowDetail } = props;

  // Hooks
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(task?.id),
    data: { groupID: groupID, type: SORTABLE_TYPE.TASK },
  });

  // Store
  const userList = useSelector((state: RootState) => state.user.userList);
  const groupList = useSelector((state: RootState) => state.group.groupList);
  const dispatch: AppDispatch = useDispatch();

  // States
  const [state, setState] = useState<TState>({
    timeoutId: '',
  });

  const { timeoutId } = state;

  const onClickAction = (event: MenuInfo, taskID: React.Key) => {
    if (event.key === MENU_KEY.KEY2) {
      onClickShowDetail(taskID);
    }
  };

  const onConfirmDelete = () => {
    dispatch(deleteTaskByID({ id: task?.id }));
  };

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = event => {
    const id = setTimeout(() => {
      if (listeners) {
        listeners.onMouseDown(event);
      }
    }, 500);
    setState(prev => ({ ...prev, timeoutId: id }));
  };

  const onMouseUp = () => {
    if (timeoutId && task) {
      clearTimeout(timeoutId);
      setState(prev => ({ ...prev, timeoutId: null }));
      onClickShowDetail(task.id);
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <Popconfirm
          placement="topLeft"
          title={'Are you sure to delete this task?'}
          description={'Delete the task'}
          okText="Yes"
          cancelText="No"
          onConfirm={onConfirmDelete}
        >
          <div className="flex p-2">
            <DeleteIcon className="mr-3" />
            <div>Delete task</div>
          </div>
        </Popconfirm>
      ),
      key: MENU_KEY.KEY1,
    },
    {
      label: (
        <div className="flex p-2">
          <EditIcon className="mr-3" />
          <div>Edit task</div>
        </div>
      ),
      key: MENU_KEY.KEY2,
    },
  ];

  return (
    <div
      style={{
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }}
      ref={setNodeRef}
      {...attributes}
    >
      {task ? (
        <Dropdown
          key={task.id}
          menu={{
            items,
            onClick: event => onClickAction(event, task.id),
          }}
          trigger={['contextMenu']}
        >
          <Card
            className="flex justify-between overflow-hidden mb-3"
            onClick={() => onClickShowDetail(task.id)}
            id={String(task.id)}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
          >
            <div key={task.id}>
              <div key={task.id} className="overflow-hidden w-52">
                <div className="font-bold mb-2 whitespace-normal">{task.name}</div>
                <div className="font-light whitespace-nowrap mb-2">{task.description}</div>
              </div>
              <div className="flex flex-col items-start gap-y-3">
                <Tag
                  bordered={false}
                  color={groupList.find(group => group.id === task.status_id)?.color}
                  className="justify-center items-center"
                >
                  {groupList.find(group => group.id === task.status_id)?.name}
                </Tag>
                {task.assignee_id !== undefined && (
                  <Tag bordered={false} className="justify-center">
                    {userList.find(user => user.id === task.assignee_id)?.name}
                  </Tag>
                )}
              </div>
            </div>
            {/* <div >
              <DragIcon />
            </div> */}
          </Card>
        </Dropdown>
      ) : null}
    </div>
  );
};
