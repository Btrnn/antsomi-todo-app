// Libraries
import { nanoid } from "nanoid";
import { useSelector, useDispatch } from 'react-redux';

//Providers
import { 
  RootState, 
  AppDispatch,
  addUser, 
  updatedUser, 
  deleteUser,
  updateTask, } from '../../../../../store';

// Icons
import {
  AddIcon,
  DeleteIcon,
  DoneIcon,
  FilterIcon,
  DragIcon,
  EditIcon,
} from "components/icons";

// Components
import {
  Button,
  Popconfirm,
  notification,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  TimeRangePickerProps,
  type Dayjs,
} from "components/ui";

// Constants
import { TASK_STATUS_KEY } from "../../../../../constants";


// Libraries
import React, { useState } from "react";

// Models
import { Task } from "../../../../../models";


interface TaskItemProp {
  index: number;
  task: Task;
};

export const TaskItem: React.FC<TaskItemProp> = (props) => {
  const { index, task } = props;

  //State
  const [state, setState] = useState({
    isEdit: false,
    edittedTask: task,
  })

  // Redux Store
  const dispatch: AppDispatch = useDispatch();
  const userList = useSelector((state: RootState) => state.user.userList);
  const groupList = useSelector((state: RootState) => state.group.groupList);
  
  const { RangePicker } = DatePicker;

  const onChangeEditStartDate = (date: Dayjs) => {
    if (date) {
      console.log('Date: ', date);
    } else {
      console.log('Clear');
    }
  };
  
  const onClickEditTask = () => {
    setState(prev => ({ ...prev, isEdit: true }))
  };

  const onClickOutEditing = () => {
    setState(prev => ({ ...prev, isEdit: false }));
    dispatch(updateTask({id: task.id, updatedTask: state.edittedTask}))
  };

  const onChangeEditTaskName = (event: any) => {
    setState(prev => ({ ...prev, 
      edittedTask: {
          ...prev.edittedTask, 
          name: event.target.value
      }
    }));
  }

  const onChangeEditTaskDescription = (event: any) => {
    setState(prev => ({ ...prev, 
      edittedTask: {
          ...prev.edittedTask, 
          description: event.target.value
      }
    }));
  }

  const onChangeEditTaskAssignee = (value: any) => {
    setState(prev => ({ ...prev, 
      edittedTask: {
          ...prev.edittedTask, 
          assignee_id: value
      }
    }));
  }

  const onChangeEditTaskStatus = (value: any) => {
    setState(prev => ({ ...prev, 
      edittedTask: {
          ...prev.edittedTask, 
          status_id: value
      }
    }));
  }

  return (
    <div>
    <div className="justify-between shadow-md p-4 rounded w-full hover:bg-slate-300 overflow-hidden mb-3 border-gray-100"  onClick={onClickEditTask}>
      <div
        key={task.id}
        className="overflow-hidden max-w-3/4"
      >
        <div className="font-bold mb-2 whitespace-normal">
          {task.name}
        </div>
        <div className="font-light whitespace-nowrap mb-2">{task.description}</div>
      </div>
      <Tag bordered = {false} color = {groupList.find((group) => group.id === task.status_id)?.color} className="justify-center">
        {groupList.find((group) => group.id === task.status_id)?.name}
      </Tag>
      <Tag bordered = {false} color = {'cyan'} className="justify-center">
        {userList.find((user) => user.id === task.assignee_id)?.name}
      </Tag>
    </div>
    <Modal  
      width={'65vw'} 
      height={'80vh'} 
      open={state.isEdit} 
      title={task.name} 
      footer ={null} onCancel={onClickOutEditing} 
      style={{ right: 0, position: 'fixed' }}
  >
      <Form variant={'borderless'} style={{ maxWidth: 600 }}>
          <Form.Item label="Task Title:" name="InputName" rules={[{ required: true, message: 'This field is required!' }]}>
              <Input placeholder= {task?.name} value={task?.name} onChange={onChangeEditTaskName}/>
          </Form.Item>
          <Form.Item label="Description:" name="InputDescription" >
              <Input placeholder= {task?.description} value={task?.description} onChange={onChangeEditTaskDescription}/>
          </Form.Item>
          <Form.Item label="Assignee:" name="ChooseAssignee" >
              <Select 
                options={userList.map(user => ({
                  value: user.id, 
                  label: user.name,  
                }))}
                onChange={onChangeEditTaskAssignee}/>
          </Form.Item>
          <Form.Item label="Status:" name="ChooseStatus" >
              <Select 
                defaultValue = {task?.status_id}
                options={groupList.map(group => ({
                  value: group.id, 
                  label: group.name, 
                }))}
                onChange={onChangeEditTaskStatus}/>
          </Form.Item>
          <Form.Item label="Start Date:" name="ChooseStartDate" >
              <DatePicker 
                onChange={onChangeEditStartDate}/>
          </Form.Item>
      </Form>
      <div className="gap-y-10">
          <div>Est Time: </div>
          <div>StartDate: </div>
          <div>EndDate: </div>
      </div>
    </Modal>
  </div>
  );
};


