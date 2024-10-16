// Libraries
import { useSelector, useDispatch } from 'react-redux';
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

//Providers
import { RootState, AppDispatch, deleteTask } from 'store';

// Icons
import { DeleteIcon, EditIcon } from 'components/icons';

// Components
import { Tag, Dropdown, type MenuProps, type MenuInfo, Card, Modal } from 'components/ui';

// Models
import { Task } from 'models';

// Constants
import { SORTABLE_TYPE, MENU_KEY } from 'constants/tasks';
import { checkAuthority } from 'utils';
import { PERMISSION } from 'constants/role';

interface TaskItemProp {
  groupInfo: {
    groupID: React.Key;
    groupName: string;
    groupColor: string;
    textColor: string;
  };
  task: Task | undefined;
  onClickShowDetail: (taskIndex: React.Key) => void;
  isOverlay: boolean;
  onDelete: (id: React.Key) => Promise<void>;
  permission: string;
}

type TState = {
  timeoutId: string | number | NodeJS.Timeout | undefined | null;
};

export const TaskItem: React.FC<TaskItemProp> = props => {
  const { groupInfo, task, onClickShowDetail, isOverlay, onDelete, permission } = props;

  // Hooks
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(task?.id),
    data: { groupID: groupInfo.groupID, type: SORTABLE_TYPE.TASK },
  });

  // Store
  const userList = useSelector((state: RootState) => state.user.userList);
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
    if (task) {
      dispatch(deleteTask({ id: task?.id }));
      onDelete(task.id);
    }
  };

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = event => {
    if (event.button === 2) {
      return;
    }
    const id = setTimeout(() => {
      if (checkAuthority(permission, PERMISSION.EDIT)) {
        if (listeners && typeof listeners.onMouseDown === 'function') {
          listeners.onMouseDown(event);
        }
      }
    }, 200);
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
        <div className="flex p-2">
          <EditIcon className="mr-3" />
          <div>Edit task</div>
        </div>
      ),
      key: MENU_KEY.KEY2,
    },
    {
      label: (
        <div
          className="flex p-2 text-red-500"
          onClick={() => {
            if (checkAuthority(permission, PERMISSION.EDIT)) {
              Modal.confirm({
                title: 'Are you sure you want to delete this task?',
                content: <div className="text-red-500 text-xs">All task data will be deleted.</div>,
                footer: (_, { OkBtn, CancelBtn }) => (
                  <>
                    <CancelBtn />
                    <OkBtn />
                  </>
                ),
                onOk: onConfirmDelete,
              });
            }
          }}
        >
          <DeleteIcon className="mr-3" />
          <div>Delete task</div>
        </div>
      ),
      key: MENU_KEY.KEY1,
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
          disabled={!checkAuthority(permission, PERMISSION.EDIT)}
        >
          <Card
            className="flex justify-between overflow-hidden mb-3 p-[5px] w-full"
            onClick={() => onClickShowDetail(task.id)}
            id={String(task.id)}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            style={{
              backgroundColor: isOverlay ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 1)',
              backdropFilter: isOverlay ? 'blur(10px)' : 'none',
              boxShadow: '0 2px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div key={task.id} className="w-full p-0">
              <div key={task.id} className="flex flex-col w-full overflow-hidden">
                <div className="flex font-bold mb-2 whitespace-normal">{task.name}</div>
                <div className="flex font-light mb-2 overflow-hidden">{task.description}</div>
              </div>
              <div className="flex flex-col items-start gap-y-3">
                <Tag
                  bordered={false}
                  color={groupInfo.groupColor}
                  className="justify-center items-center"
                  style={{ color: groupInfo.textColor }}
                >
                  {groupInfo.groupName}
                </Tag>
                {task.assignee_id !== '' && (
                  <Tag bordered={false} className="justify-center">
                    {userList.find(user => user.id === task.assignee_id)?.name}
                  </Tag>
                )}
              </div>
            </div>
          </Card>
        </Dropdown>
      ) : null}
    </div>
  );
};
