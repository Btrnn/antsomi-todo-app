// Libraries
import React, { useState } from 'react';
import { MenuItemType } from 'antd/es/menu/interface';
import { NavLink, Outlet } from 'react-router-dom';

// Images
import logo from '../../assets/images/logo.png';

// Icons
import { UserIcon, SettingIcon, HomeIcon, DataIcon } from 'components/icons';

// Components
import { Layout, Menu, Avatar, type MenuInfo, Divider, Breadcrumb } from 'components/ui';
import { UserDrawer } from './UserDrawer';

// Constants
import { globalToken } from '../../constants';

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
  });
  const { isOpenSetting, title } = state;

  const items = MENU_ITEMS?.map(item => {
    return {
      ...item,
      label: <NavLink to={`${item?.key || ''}`}>{item?.label}</NavLink>,
    };
  });

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
      case 'home':
        setState(prev => ({
          ...prev,
          title: 'Home',
        }));
        break;
      case 'tasks':
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
        style={{ boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)', height: '100vh' }}
      >
        <div className="flex items-center align-middle ml-9 h-24">
          <img className="h-[50%]" src={logo} alt="logo" />
          <div> TO DO APP </div>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['home']}
          items={items}
          onClick={onClickSelectMenu}
        />
      </Sider>
      <Layout className="h-full">
        <Header
          className="flex justify-end items-center h-[7vh]"
          style={{ padding: 20, background: colorBgContainer }}
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
        {/* <Divider /> */}
        <Content>
          <div
            style={{
              padding: 20,
              height: '93vh',
              width: '100%',
              background: colorBgContainer,
            }}
          >
            <div className="ml-9 mb-5">
              <div className=" font-black text-3xl align-bottom">{title}</div>
              <Breadcrumb items={[{ title: 'Home' }, { title: 'Task List' }]} className="mt-5" />
            </div>
            <Outlet />
          </div>
        </Content>
        <UserDrawer isOpen={isOpenSetting} isClose={onCloseUserSetting} />
      </Layout>
    </Layout>
  );
};
