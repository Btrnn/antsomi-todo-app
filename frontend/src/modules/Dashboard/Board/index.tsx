// Libraries
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Components
import { Button, Result } from 'components/ui';
import { GroupList } from './components/GroupList';
import { TaskDrawer } from './components/TaskDetailDrawer';

// Constants
import { OBJECT_TYPE } from 'constants/common';

// Hooks
import { useGroupList, usePermission, useTaskList } from 'hooks';

export const Board: React.FC = () => {
  const params = useParams();

  // Hooks
  const { permission, isError } = usePermission(params?.boardId ?? '', OBJECT_TYPE.BOARD);

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
      <GroupList boardId={params?.boardId ?? ''} type={'status'} permission={permission ?? ''} />
      <TaskDrawer permission={permission ?? ''} />
    </>
  );
};
