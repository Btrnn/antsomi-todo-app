// Libraries
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';

// Icons
import { UserIcon, HomeIcon, LogoutIcon, ProfileIcon } from 'components/icons';

// Components
import { Drawer, Avatar, Menu, type MenuProps, type MenuInfo, message } from 'components/ui';

// Constants
import { MENU_KEY } from 'constants/tasks';

// Stores
import { RootState, AppDispatch, setGroupList, setTaskList } from 'store';
import { useLoggedUser } from 'hooks';

interface UserDrawerProp {
  isOpen: boolean;
  onClose: () => void;
}

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    key: MENU_KEY.KEY1,
    icon: <HomeIcon />,
    label: 'Home',
  },
  {
    key: MENU_KEY.KEY2,
    icon: <ProfileIcon />,
    label: 'Profile',
  },
  {
    key: MENU_KEY.KEY3,
    icon: <UserIcon />,
    label: 'Account Setting',
  },
  {
    key: MENU_KEY.KEY4,
    icon: <LogoutIcon />,
    label: 'Logout',
    danger: true,
  },
];

export const UserDrawer: React.FC<UserDrawerProp> = props => {
  const { isOpen, onClose: isClose } = props;

  const [messageCreate, contextHolder] = message.useMessage();

  // Routes
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  // Cookies
  const cookies = new Cookies();

  // Stores
  // const currentUser = useSelector((state: RootState) => state.user.currentUser);

  // Hooks
  const { user } = useLoggedUser();

  const onClose = () => {
    isClose();
  };

  const onClickSelectMenu = (event: MenuInfo) => {
    switch (event.key) {
      case MENU_KEY.KEY1:
        navigate('/about');
        break;
      case MENU_KEY.KEY2:
        navigate('/profile');
        break;
      case MENU_KEY.KEY3:
        navigate('/setting');
        break;
      case MENU_KEY.KEY4:
        cookies.remove('authToken', { path: '/' });
        messageCreate.open({
          type: 'warning',
          content: 'You have been logged out.',
        });
        setTimeout(() => {
          dispatch(setGroupList([]));
          dispatch(setTaskList([]));
          navigate('/login');
        }, 1000);
        break;
      default:
        break;
    }
    isClose();
  };

  return (
    <Drawer
      title={
        <div className="flex flex-col items-center space-y-4 mt-10">
          <Avatar size={100} icon={<UserIcon />} />
          <div className="text-lg font-bold">{user?.name || 'Anonymous'}</div>
        </div>
      }
      placement="right"
      size={'default'}
      onClose={onClose}
      open={isOpen}
      footer={false}
      closeIcon={null}
    >
      {contextHolder}
      <Menu
        onClick={onClickSelectMenu}
        className="w-full h-full m-0 space-y-5"
        mode="inline"
        items={items}
      />
    </Drawer>
  );
};
