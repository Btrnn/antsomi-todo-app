// Libraries
import { useDispatch } from 'react-redux';
import React, { useEffect } from 'react';

//Providers
import { AppDispatch } from 'store';

// Icons
import {} from 'components/icons';

// Models
import { Task } from 'models';

// Types
import { IdentifyId } from 'types';

interface SubTaskProp {
  taskID: IdentifyId;
}

export const SubTasks: React.FC<SubTaskProp> = props => {
  const { taskID } = props;

  // Store
  // const dispatch: AppDispatch = useDispatch();
  // const userList = useSelector((state: RootState) => state.user.userList);
  // const groupList = useSelector((state: RootState) => state.group.groupList);

  // Effects

  // Handlers

  return <div>SubTasks</div>;
};
