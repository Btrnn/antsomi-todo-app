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
  Tag,
  type MenuInfo,
  type MenuProps,
} from 'components/ui';
import { GroupList } from './components/GroupList';
import { MENU_KEY } from 'constants/tasks';
import { getPermission } from 'services';

export const Board: React.FC = () => {
  const [permission, setPermission] = useState<string | null>(null);
  const params = useParams();

  useEffect(() => {
    const boardId = params?.boardId ?? '';
    if (boardId) {
      getPermission(boardId)
        .then(response => {
          setPermission(response.data);
        })
        .catch(error => {
          console.error('Error fetching permission:', error);
        });
    }
  }, [params?.boardId]);

  return (
    <GroupList boardId={params?.boardId ?? ''} type={'status'} permission={permission ?? ''} />
  );
};
