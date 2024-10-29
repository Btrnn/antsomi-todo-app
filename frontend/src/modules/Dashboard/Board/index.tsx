// Libraries
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Components
import { Button, Result } from 'components/ui';
import { GroupList } from './components/GroupList';

// Services
import { TaskDrawer } from './components/TaskDetailDrawer';
import { OBJECT_TYPE } from 'constants/common';
import { useGroupList, usePermission, useTaskList } from 'hooks';

export const Board: React.FC = () => {
  //const [permission, setPermission] = useState<string | null>(null);
  //const [isError, setIsError] = useState(false);
  const params = useParams();

  // Hooks
  const { permission, isError } = usePermission(params?.boardId ?? '', OBJECT_TYPE.BOARD);

  const { taskList } = useTaskList(params.boardId ?? '');
  const { groupList } = useGroupList(params.boardId ?? '');
  // console.log('🚀 ~ taskList:', taskList);
  // console.log('🚀 ~ groupList:', groupList);

  return isError ? (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Button type="primary" href="/dashboard/board">
          Back To Board List
        </Button>
      }
    />
  ) : (
    <>
      <GroupList
        boardId={params?.boardId ?? ''}
        type={'status'}
        permission={permission ?? ''}
        taskList={taskList}
        groupList={groupList}
      />
      <TaskDrawer permission={permission ?? ''} />
    </>
  );
};
