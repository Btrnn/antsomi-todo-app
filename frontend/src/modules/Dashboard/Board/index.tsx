// Libraries
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// Icons
import {
  AddFilledIcon,
  AddIcon,
  ClearIcon,
  ColorIcon,
  DeleteIcon,
  DragIcon,
  EditIcon,
  MoreIcon,
} from 'components/icons';

// Stores
import { AppDispatch, RootState } from 'store';

// Components
import {
  Button,
  Card,
  Color,
  ColorPicker,
  Dropdown,
  Input,
  message,
  Modal,
  Result,
  Tag,
  type MenuInfo,
  type MenuProps,
} from 'components/ui';
import { GroupList } from './components/GroupList';

// Services
import { getPermission } from 'services';

export const Board: React.FC = () => {
  const [permission, setPermission] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const params = useParams();

  useEffect(() => {
    const boardId = params?.boardId ?? '';
    if (boardId) {
      getPermission(boardId)
        .then(response => {
          setPermission(response.data);
        })
        .catch(error => {
          setIsError(true);
        });
    }
  }, [params?.boardId]);

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
    <GroupList boardId={params?.boardId ?? ''} type={'status'} permission={permission ?? ''} />
  );
};
