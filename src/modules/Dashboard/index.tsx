// Libraries
import React, { useEffect, useRef, useState } from 'react';
import { MenuItemType } from 'antd/es/menu/interface';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

// Images
import logo from '../../assets/images/logo.png';

// Icons
import { UserIcon, SettingIcon, HomeIcon, DataIcon } from 'components/icons';

// Components
import { Layout, Menu, Avatar, type MenuInfo, Divider, Breadcrumb } from 'components/ui';
import { UserDrawer } from './UserDrawer';

// Constants
import { DASHBOARD_KEY, globalToken } from '../../constants';

const { Sider, Header, Content } = Layout;
const { colorBgContainer } = globalToken;

const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'home',
    icon: <HomeIcon />,
    label: 'Home',
  },
  {
    key: 'tasks',
    icon: <DataIcon />,
    label: 'Tasks',
  },
];

export const Dashboard: React.FC = () => {
  // State
  const [state, setState] = useState({
    isOpenSetting: false,
    title: 'Home',
    selectedKey: '',
  });
  const { isOpenSetting, title, selectedKey } = state;

  const location = useLocation();

  const items = MENU_ITEMS?.map(item => {
    return {
      ...item,
      label: <NavLink to={`${item?.key || ''}`}>{item?.label}</NavLink>,
    };
  });

  useEffect(() => {
    const { pathname } = location;

    let currentTitle = 'Home';
    let currentKey = '';
    if (pathname.includes('/tasks')) {
      currentTitle = 'Task List';
      currentKey = DASHBOARD_KEY.TASKS;
    } else if (pathname.includes('/home')) {
      currentTitle = 'Home';
      currentKey = DASHBOARD_KEY.HOME;
    }

    setState(prevState => ({
      ...prevState,
      title: currentTitle,
      selectedKey: currentKey,
    }));
  }, [location]);

  const onClickShowUserSetting = () => {
    setState(prev => ({
      ...prev,
      isOpenSetting: true,
    }));
  };

  const onCloseUserSetting = () => {
    setState(prev => ({
      ...prev,
      isOpenSetting: false,
    }));
  };

  const onClickSelectMenu = (event: MenuInfo) => {
    switch (event.key) {
      case DASHBOARD_KEY.HOME:
        setState(prev => ({
          ...prev,
          title: 'Home',
        }));
        break;
      case DASHBOARD_KEY.TASKS:
        setState(prev => ({
          ...prev,
          title: 'Task List',
        }));
        break;
      default:
        break;
    }
  };

  return (
    <Layout>
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        width={'15vw'}
        style={{ boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)', height: '100vh', display: 'flex' }}
      >
        <div className="flex flex-row items-center align-middle ml-9 h-24">
          <img className="h-10" src={logo} alt="logo" />
          <div> TO DO APP </div>
        </div>
        <div style={{ width: '15vw' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={items}
            onClick={onClickSelectMenu}
          />
        </div>
      </Sider>
      <Layout className="h-screen">
        <Header
          className="flex justify-end items-center p-5 shrink-0"
          style={{ background: colorBgContainer }}
        >
          <div className="flex items-center mr-1">
            <SettingIcon className="mr-4" style={{ fontSize: '22px', cursor: 'pointer' }} />
            <Avatar
              size={30}
              icon={<UserIcon />}
              onClick={onClickShowUserSetting}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </Header>
        <Content
          className="px-10 py-2 flex flex-col h-full w-full overflow-auto"
          style={{
            background: colorBgContainer,
          }}
        >
          <div className="mb-10">
            <div className=" font-black align-bottom text-3xl">{title}</div>
            <Breadcrumb
              items={[{ title: 'Home' }, { title: 'Task List' }]}
              className="mt-5 text-sm"
            />
          </div>

          <Outlet />
        </Content>
        <UserDrawer isOpen={isOpenSetting} isClose={onCloseUserSetting} />
      </Layout>
    </Layout>
  );
};
