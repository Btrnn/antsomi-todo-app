// Libraries
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Icons
import { AddIcon, DeleteIcon, DragIcon, EditIcon } from 'components/icons';

// Components
import {
  Input,
  Popconfirm,
  Tag,
  ColorPicker,
  Color,
  Dropdown,
  type MenuProps,
  type MenuInfo,
  Card,
  Button,
} from 'components/ui';
import { TaskList } from '../TaskList';

// Providers
import { AppDispatch, updateGroup, deleteTaskByGroupID, setTaskList } from 'store';

// Models
import { Group, Task } from 'models';

// Constants
import { SORTABLE_TYPE, MENU_KEY } from 'constants/tasks';

// Services
import { updateGroup as updateGroupAPI } from 'services/group';
import { createTask, getAllTasks } from 'services/task';

interface GroupItemProps {
  group: Group | undefined;
  taskList: Task[];
  onDelete: (id: React.Key) => Promise<void>;
}

type TState = {
  isAdding: boolean;
  inputTask: string;
  isRename: boolean;
  groupSelected: string;
  groupNewName: string | undefined;
  error: string;
};

export const GroupItem: React.FC<GroupItemProps> = props => {
  const { group, taskList, onDelete } = props;

  // Hooks
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(group?.id),
    data: { type: SORTABLE_TYPE.GROUP },
  });

  // Store
  const dispatch: AppDispatch = useDispatch();

  // State
  const [state, setState] = useState<TState>({
    isAdding: false,
    inputTask: '',
    isRename: false,
    groupSelected: '',
    groupNewName: '',
    error: '',
  });

  const { isAdding, inputTask, isRename, groupSelected, groupNewName, error } = state;

  // Handlers
  const onChangeGroupNewName = (event: React.ChangeEvent<HTMLInputElement> | undefined) => {
    setState(prev => ({ ...prev, groupNewName: event?.target.value }));
  };

  const onConfirmDelete = () => {
    if (group) {
      dispatch(deleteTaskByGroupID({ groupID: group?.id }));
      onDelete(group.id);
    }
  };

  const onEnterRenameGroup = (groupID: React.Key) => {
    dispatch(updateGroup({ id: groupID, updatedGroup: { name: groupNewName } }));
    updateGroupAPI(groupID, { name: groupNewName });
    setState(prev => ({ ...prev, isRename: false, groupNewName: '' }));
  };

  const onClickAction = (event: MenuInfo, groupID: React.Key, groupName: string) => {
    if (event.key === MENU_KEY.KEY2) {
      setState(prev => ({
        ...prev,
        isRename: true,
        groupSelected: String(groupID),
        groupNewName: groupName,
      }));
    }
  };

  const onChangeSetColor = (value: Color, groupID: React.Key) => {
    if (typeof value === 'string') {
      dispatch(updateGroup({ id: groupID, updatedGroup: { color: value } }));
      updateGroupAPI(groupID, { color: value });
    } else if (value && 'toHexString' in value) {
      dispatch(
        updateGroup({
          id: groupID,
          updatedGroup: { color: value.toHexString() },
        }),
      );
      updateGroupAPI(groupID, { color: value.toHexString() });
    } else {
      return;
    }
  };

  const onChangeInputTask = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, inputTask: event.target.value }));
  };

  const onClickAddTask = async () => {
    let errorMesage = '';
    let isAdd = true;

    if (inputTask.length === 0) {
      errorMesage = 'This field is required';
    } else if (inputTask.length > 255) {
      errorMesage = 'Name is too long, max length is 255 characters';
    } else if (taskList.some(task => task.name === inputTask)) {
      errorMesage = 'Task already exists!';
    }

    if (!errorMesage && group) {
      const newTask: Omit<Task, "id"|"created_at" |"start_date"|"end_date"| "owner_id"> = { 
        name: inputTask,
        description: '',
        est_time: '',
        assignee_id: '',
        status_id: group.id, 
        position : (taskList.filter(task => task.status_id === group.id)).length,
      };
      const createdTask = await createTask(newTask);
      getTaskList();
      isAdd = false;
      //dispatch(addTask(newTask));
    }

    setState(prev => ({ ...prev, inputTask: '', error: errorMesage, isAdding: isAdd }));
  };

  const onClickBeginAdding = () => {
    if (isAdding === true) {
      setState(prev => ({ ...prev, isAdding: false }));
    } else {
      setState(prev => ({ ...prev, isAdding: true, error: '' }));
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <Popconfirm
          placement="topLeft"
          title={'Are you sure to delete this group?'}
          description={'Delete the group'}
          okText="Yes"
          cancelText="No"
          onConfirm={onConfirmDelete}
        >
          <div className="flex p-2">
            <DeleteIcon className="mr-3" />
            <div>Delete group</div>
          </div>
        </Popconfirm>
      ),
      key: MENU_KEY.KEY1,
    },
    {
      label: (
        <div className="flex p-2">
          <EditIcon className="mr-3" />
          <div>Rename</div>
        </div>
      ),
      key: MENU_KEY.KEY2,
    },
  ];

  const getTaskList = async () => {
    try {
      const fetchedTasks = await getAllTasks();
      dispatch(setTaskList(fetchedTasks.data));
    } catch (error) {
      console.log(error);
    }
  };

  // Use Effect
  useEffect(() => {
    getTaskList();
  }, []);

  return group ? (
    <Card
      title={
        <Dropdown
          key={group.id}
          menu={{
            items,
            onClick: event => onClickAction(event, group.id, group.name),
          }}
          trigger={['contextMenu']}
        >
          <div
            key={group.id}
            className="flex justify-between items-center mt-5 pb-5 border-b-[0.5px] border-b-yellow-900"
          >
            {isRename && group.id === groupSelected ? (
              <Input
                className="w-1/2"
                style={{
                  boxShadow: 'none',
                  borderColor: 'transparent',
                }}
                value={groupNewName || group.name}
                onChange={onChangeGroupNewName}
                onPressEnter={() => onEnterRenameGroup(group.id)}
                onBlur={() => onEnterRenameGroup(group.id)}
              />
            ) : (
              <ColorPicker trigger="click" onChange={value => onChangeSetColor(value, group.id)}>
                <Tag
                  bordered={false}
                  color={group.color}
                  style={{ fontSize: '12px', padding: '5px 10px' }}
                >
                  {group.name}
                </Tag>
              </ColorPicker>
            )}
            <div className="flex items-center">
              <AddIcon className="mr-2 text-black" onClick={onClickBeginAdding} />
              <div className="text-black" {...listeners}>
                <DragIcon />
              </div>
            </div>
          </div>
        </Dropdown>
      }
      bordered={false}
      key={group.id}
      style={{
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: '#f5f5f5',
      }}
      ref={setNodeRef}
      {...attributes}
    >
      {isAdding && (
        <div className="mb-5 w-[270px]">
          <div className="flex gap-1">
            <Input
              className="p-2"
              placeholder="Add new task"
              style={{
                outline: 'none',
                boxShadow: 'none',
                borderColor: 'transparent',
              }}
              value={inputTask}
              onChange={onChangeInputTask}
              onPressEnter={onClickAddTask}
            />
            <Button className="w-9 h-9 border-none" onClick={onClickAddTask}>
              <AddIcon />
            </Button>
          </div>
          <div className="text-red-500">{error}</div>
        </div>
      )}
      <TaskList groupInfo={group} taskList={taskList} />
    </Card>
  ) : null;
};
