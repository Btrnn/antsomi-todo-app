// Libraries
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';

//Providers
import { RootState, AppDispatch, updateTask } from 'store';

// Icons
import {} from 'components/icons';

// Components
import { Tag, Form, Input, Select, DatePicker, InputNumber, Flex, Button } from 'components/ui';

// Models
import { Task } from 'models';

// Services
import { updateTask as updatedTaskAPI } from 'services/task';

interface SubTaskProp {
  task: Task;
}

type FormType = Task;

export const SubTasks: React.FC<SubTaskProp> = props => {
  const { task } = props;

  // Store
  const dispatch: AppDispatch = useDispatch();
  const userList = useSelector((state: RootState) => state.user.userList);
  const groupList = useSelector((state: RootState) => state.group.groupList);

  // Effects

  // Handlers

  return <div>SubTasks</div>;
};
