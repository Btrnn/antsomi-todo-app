// Libraries
import React from 'react';
import { useDispatch } from 'react-redux';

//Providers
import { AppDispatch } from 'store';

// Icons
import {} from 'components/icons';

// Components

// Models
import { Task } from 'models';

// Services

// Types
import { IdentifyId } from 'types';

interface CommentProp {
  taskID: IdentifyId;
}

type FormType = Task;

export const Comments: React.FC<CommentProp> = props => {
  const { taskID } = props;

  // Store
  const dispatch: AppDispatch = useDispatch();
  // const userList = useSelector((state: RootState) => state.user.userList);
  // const groupList = useSelector((state: RootState) => state.group.groupList);

  // Effects

  // Handlers

  return <div>Comments</div>;
};
