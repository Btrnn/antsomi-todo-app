// Libraries
import React from "react";
import { MenuProps } from "antd";
import { useLocation } from "react-router-dom";
import { NavLink, Outlet } from "react-router-dom";

// Images
import logo from "../../assets/images/pexels-photo-430205.webp";

// Components
import { Layout, Menu } from "components/ui";

// Constants
import { globalToken } from "../../constants";

interface DashboardProps {}

const { Sider, Header, Content, Footer } = Layout;
const { colorBgContainer, borderRadiusLG } = globalToken;

const MENU_ITEMS: MenuProps["items"] = [
  {
    key: "home",
    label: "Home",
  },
  {
    key: "tasks",
    label: "Tasks",
  },
];

export const Dashboard: React.FC<DashboardProps> = (props) => {
  const { ...restProps } = props;
  const location = useLocation();
  console.log("🚀 ~ location:", location);

  console.log("render dashboard :: ");
  const items = MENU_ITEMS.map((item: any) => {
    return {
      ...item,
      label: <NavLink to={item?.key}>{item?.label}</NavLink>,
    };
  });

  return (
    <Layout>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div className="demo-logo-vertical">
          <img src={logo} alt="logo" />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["4"]}
          items={items}
        />
      </Sider>
      <Layout className="h-screen">
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "24px 16px 0" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};
