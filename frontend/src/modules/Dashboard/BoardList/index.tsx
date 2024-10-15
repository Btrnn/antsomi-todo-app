// Libraries
import React, { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
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
  List,
  message,
  Modal,
  Tag,
  type MenuInfo,
  type MenuProps,
} from 'components/ui';
import { MENU_KEY } from 'constants/tasks';

export const BoardList: React.FC = () => {
  //   const params = useParams();

  // Store
  const dispatch: AppDispatch = useDispatch();
  const ownedBoardList = useSelector((state: RootState) => state.board.ownedList);
  const sharedBoardList = useSelector((state: RootState) => state.board.sharedList);

  return (
    <div className="flex flex-col w-full h-full">
      {/* <div className="flex text-xl">Your boards</div> */}
      <List
        header="Your Boards"
        itemLayout="horizontal"
        dataSource={ownedBoardList}
        renderItem={(item, index) => (
          <List.Item className="flex h-full overflow-auto align-top">
            <List.Item.Meta
              title={<NavLink to={`/dashboard/board/${item.id}`}>{item.name}</NavLink>}
              description={<>{item.owner_id}</>}
            />
          </List.Item>
        )}
      />
      <List
        header="Shared with you"
        className="overflow-auto"
        itemLayout="horizontal"
        dataSource={sharedBoardList}
        renderItem={(item, index) => (
          <List.Item className="h-full overflow-auto">
            <List.Item.Meta
              title={<NavLink to={`/dashboard/board/${item.id}`}>{item.name}</NavLink>}
              description={<>{item.owner_id}</>}
            />
          </List.Item>
        )}
      />
    </div>
  );
};
