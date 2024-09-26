// Libraries
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Icons
import { UserIcon, HomeIcon, LogoutIcon, ProfileIcon } from 'components/icons';

// Components
import { Drawer, Avatar, Menu, type MenuProps, type MenuInfo } from 'components/ui';

// Constants
import { MENU_KEY } from 'constants/tasks';

interface UserDrawerProp {
  isOpen: boolean;
  isClose: () => void;
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
  const { isOpen, isClose } = props;

  const navigate = useNavigate();

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
        window.location.replace('/login');
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
          <div className="text-lg font-bold">User A</div>
        </div>
      }
      placement="right"
      size={'default'}
      onClose={onClose}
      open={isOpen}
      footer={false}
      closeIcon={null}
    >
      <Menu
        onClick={onClickSelectMenu}
        className="w-full h-full m-0 space-y-5"
        defaultSelectedKeys={['1']}
        mode="inline"
        items={items}
      />
    </Drawer>
  );
};
