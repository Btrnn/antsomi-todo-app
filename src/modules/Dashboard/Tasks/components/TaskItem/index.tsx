// Libraries
import { nanoid } from "nanoid";
import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";


//Providers
import {
  RootState,
  AppDispatch,
  addUser,
  updatedUser,
  deleteUser,
  updateTask,
} from "store";

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
  Flex,
} from "components/ui";


// Models
import { Task } from "models";


interface TaskItemProp {
  index: number;
  task: Task;
  onClickShowDetail: (taskIndex: React.Key) => void;
}


export const TaskItem: React.FC<TaskItemProp> = (props) => {
  const { index, task, onClickShowDetail } = props;

  //State
  const [state, setState] = useState({
    
  });

  // Redux Store
  const userList = useSelector((state: RootState) => state.user.userList);
  const groupList = useSelector((state: RootState) => state.group.groupList);



  return (
    <>
      <div
        className="justify-between p-4 rounded w-full overflow-hidden mb-3"
        style={{ border: "1px solid #d9d9d9", margin: '0' }}
        onClick={() => onClickShowDetail(task.id)}
      >
        <div key={task.id} className="overflow-hidden max-w-3/4">
          <div className="font-bold mb-2 whitespace-normal">{task.name}</div>
          <div className="font-light whitespace-nowrap mb-2">
            {task.description}
          </div>
        </div>
        <Tag
          bordered={false}
          color={groupList.find((group) => group.id === task.status_id)?.color}
          className="justify-center"
        >
          {groupList.find((group) => group.id === task.status_id)?.name}
        </Tag>
        <Tag bordered={false} color={"cyan"} className="justify-center">
          {userList.find((user) => user.id === task.assignee_id)?.name}
        </Tag>
      </div>
    </>
  );
};
