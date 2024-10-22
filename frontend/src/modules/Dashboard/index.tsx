// Libraries
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

// Images
import logo from "../../assets/images/logo.png";

// Icons
import {
  UserIcon,
  SettingIcon,
  HomeIcon,
  DataIcon,
  DownIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  ShareIcon,
  ViewerIcon,
  CommenterIcon,
  EditorIcon,
  ManagerIcon,
  ColorIcon,
  CloseIcon,
  MoreIcon,
} from "components/icons";

// Components
import {
  Layout,
  Menu,
  Avatar,
  type MenuInfo,
  Breadcrumb,
  type MenuProps,
  TreeDataNode,
  Input,
  Button,
  message,
  Dropdown,
  Modal,
  Tag,
  Select,
  Divider,
  Tooltip,
  Card,
  List,
  Typography,
  LevelKeysProps,
} from "components/ui";
import { UserDrawer } from "../../components/common";

// Constants
import {
  DASHBOARD_KEY,
  DASHBOARD_NAME,
  globalToken,
  MENU_KEY,
  PERMISSION,
  ROLE_KEY,
  ROLE_OPTIONS,
} from "../../constants";

// Models
import { Board } from "models";

// Services
import {
  createBoard,
  getAllBoards,
  updateBoard as updateBoardAPI,
  deleteBoard as deleteBoardAPI,
  shareBoard,
  getAccessList,
  updateAccessBoard,
  getPermission,
} from "services/board";
import { getInfo } from "services";

// Stores
import {
  setOwnedList,
  RootState,
  AppDispatch,
  setSharedList,
  updateBoard,
  reorderBoardAsync,
  deleteBoard,
  setPermission,
} from "store";

import { IdentifyId } from "types";
import { ShareAccessModal } from "components/common";
import { checkAuthority, getDashBoardLevelKeys, getParentKeys } from "utils";

// Hooks
import { useBoardList } from "hooks";


const { Sider, Header, Content } = Layout;
const { colorBgContainer } = globalToken;

// Types
type TState = {
  isOpenSetting: boolean;
  title: string;
  selectedKey: string;
  inputBoardName: string;
  isRename: boolean;
  boardNewName: string | undefined;
  objectSelected: string;
  isAdding: boolean;
  isSharing: boolean;
  boardSharedName: string;
  shareUsers: { id: React.Key; name: string; email: string; role: string }[];
  inputUser: string;
  error: string;
  selectedRole: string;
  alreadySharedList: {
    id: string;
    name: string;
    email: string;
    permission: string;
  }[];
  isAddingUser: boolean;
  isOpenBoardMenu: boolean;
  userPermission: string;
  selectedPath: { title: string }[];
  isLoading: boolean;
  openList: string[];
};

type MenuItem = Required<MenuProps>["items"][number];

export const Dashboard: React.FC = () => {
  const [messageCreate, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  

  // State
  const [state, setState] = useState<TState>({
    isOpenSetting: false,
    title: "Home",
    selectedKey: "",
    inputBoardName: "",
    isRename: false,
    boardNewName: "",
    objectSelected: "",
    isAdding: false,
    isSharing: false,
    boardSharedName: "",
    shareUsers: [],
    inputUser: "",
    error: "",
    selectedRole: ROLE_KEY.VIEWER,
    alreadySharedList: [],
    isAddingUser: false,
    isOpenBoardMenu: false,
    userPermission: "",
    selectedPath: [],
    isLoading: true,
    openList: [],
  });
  const {
    isOpenSetting,
    title,
    selectedKey,
    inputBoardName,
    boardNewName,
    isRename,
    objectSelected,
    isAdding,
    isSharing,
    boardSharedName,
    inputUser,
    error,
    shareUsers,
    selectedRole,
    alreadySharedList,
    isAddingUser,
    isOpenBoardMenu,
    userPermission,
    selectedPath,
    isLoading,
    openList,
  } = state;

  // Store
  const dispatch: AppDispatch = useDispatch();

  //List
  const boardActionItems: MenuItem[] = [
    ...(checkAuthority(userPermission, PERMISSION[ROLE_KEY.EDITOR])
      ? [
          {
            label: (
              <div className="flex p-2">
                <EditIcon className="mr-3" />
                <div>Rename</div>
              </div>
            ),
            key: MENU_KEY.KEY2,
          },
        ]
      : []),
    {
      label: (
        <div className="flex p-2">
          <ShareIcon className="mr-3" />
          <div>Share</div>
        </div>
      ),
      key: MENU_KEY.KEY3,
    },
    ...(checkAuthority(userPermission, PERMISSION.owner)
      ? [
          {
            label: (
              <div className="flex p-2 text-red-500">
                <DeleteIcon className="mr-3" />
                <div>Delete</div>
              </div>
            ),
            key: MENU_KEY.KEY1,
          },
        ]
      : []),
  ];

  // Hooks
  const location = useLocation();
  const params = useParams();
  const {
    owned: ownedBoardList,
    shared: sharedBoardList,
    isLoading: boardLoading,
  } = useBoardList();

  // Memo
  const roleOptions = useMemo(() => {
    return Object.values(ROLE_OPTIONS).map(({ value, label, Icon }) => ({
      value,
      label: (
        <>
          <Icon className="mr-2 my-2" />
          {label}
        </>
      ),
    }));
  }, []);

  // Effects
  useEffect(() => {
    const { pathname } = location;
    let currentTitle = "Home";
    let currentKey = "";
    let isSubMenu = true;
    let openList: string[] = [];

    if (pathname.includes("/home")) {
      currentTitle = DASHBOARD_NAME[DASHBOARD_KEY.HOME];
      currentKey = DASHBOARD_KEY.HOME;
      isSubMenu = false;
    } else if (pathname.includes("/board")) {
      openList.push(DASHBOARD_KEY.BOARD)
      if(params.boardId){
        openList = pathList.find((path) => path.key === params.boardId)?.path || []
      }
      currentKey = DASHBOARD_KEY.BOARD;
      currentTitle =
        [...ownedBoardList, ...sharedBoardList].find(
          (board) => board.id === params?.boardId
        )?.name || "Board List";
    }

    setState((prevState) => ({
      ...prevState,
      title: currentTitle,
      selectedKey: params.boardId ?? currentKey,
      objectSelected: params?.boardId ?? currentKey,
      selectedPath: isSubMenu ? [{ title: currentTitle }] : [],
      openList: openList,
    }));
  }, [location, boardLoading]);

  // Handles
  const onClickSelectBoard = async (objectID: IdentifyId) => {
    try {
      const userPermission = await getPermission(objectID);
      dispatch(setPermission(userPermission.data));
      navigate(`/dashboard/board/${objectID}`);
      setState((prev) => ({
        ...prev,
        userPermission: userPermission.data,
      }));
    } catch (error) {
      messageCreate.open({
        type: "error",
        content: error as string,
      });
    }
  };

  const onClickShowBoardMenu = async (objectID: IdentifyId) => {
    setState((prev) => ({
      ...prev,
      isOpenBoardMenu: true,
      objectSelected: objectID as string,
    }));
  };

  const onClickHideBoardMenu = async () => {
    setState((prev) => ({
      ...prev,
      isOpenBoardMenu: false,
    }));
  };

  const onClickShowUserSetting = () => {
    setState((prev) => ({
      ...prev,
      isOpenSetting: true,
    }));
  };

  const onCloseUserSetting = () => {
    setState((prev) => ({
      ...prev,
      isOpenSetting: false,
    }));
  };

  // Handle "ADD"
  const onChangeInputBoard = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, inputBoardName: event.target.value }));
  };

  const onClickBeginAddingBoard = () => {
    setState((prev) => ({ ...prev, isAdding: true }));
  };

  const onClickAddBoard = async (event: any) => {
    if (inputBoardName !== "") {
      const boardExists = ownedBoardList.some(
        (board) => board.name === inputBoardName
      );
      if (boardExists) {
        messageCreate.open({
          type: "error",
          content: "Board already exists!",
        });
        if (event.type === "blur") {
          setState((prev) => ({
            ...prev,
            inputBoardName: "",
            isAdding: false,
          }));
        }
      } else {
        try {
          const newBoard: Partial<Board> = {
            name: inputBoardName,
            position: ownedBoardList.length,
          };
          const createdBoard = await createBoard(newBoard);
          messageCreate.open({
            type: "success",
            content: <div>New board added!</div>,
          });
        } catch (error) {
          messageCreate.open({
            type: "error",
            content: error as string,
          });
        }
        setState((prev) => ({ ...prev, inputBoardName: "", isAdding: false }));
      }
    } else {
      setState((prev) => ({ ...prev, isAdding: false }));
    }
  };

  const onClickAction = async (
    event: MenuInfo,
    boardID: React.Key,
    boardName: string
  ) => {
    navigate(`/dashboard/board/${boardID}`);
    if (event.key === MENU_KEY.KEY2) {
      onClickBeginRenaming(boardID, boardName);
    } else if (event.key === MENU_KEY.KEY1) {
      Modal.confirm({
        title: "Are you sure you want to delete this board?",
        content: (
          <div className="text-red-500 text-xs">
            Deleting this board will remove all its groups.
          </div>
        ),

        footer: (_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        ),
        onOk: () => onConfirmDeleteBoard(boardID),
      });
    } else if (event.key === MENU_KEY.KEY3) {
      try {
        const accessList = await getAccessList(boardID);
        setState((prev) => ({
          ...prev,
          isSharing: true,
          objectSelected: boardID as string,
          boardSharedName: boardName,
          alreadySharedList: accessList.data,
        }));
      } catch (error) {
        messageCreate.open({
          type: "error",
          content: error as string,
        });
      }
    }
  };

  // Handle "SHARE"
  const onCloseShareAccessModal = async () => {
    setState((prev) => ({
      ...prev,
      objectSelected: "",
      boardSharedName: "",
      isSharing: false,
      alreadySharedList: [],
    }));
  };

  const onShareComplete = async () => {
    try {
      const accessList = await getAccessList(objectSelected);
      setState((prev) => ({
        ...prev,
        alreadySharedList: accessList.data,
      }));
    } catch (error) {
      messageCreate.open({
        type: "error",
        content: error as string,
      });
    }
  };

  // Handle "RENAME"
  const onClickBeginRenaming = (objectID: React.Key, objectName: string) => {
    setState((prev) => ({
      ...prev,
      isRename: true,
      objectSelected: objectID as string,
      boardNewName: objectName,
    }));
  };

  const onChangeBoardNewName = (
    event: React.ChangeEvent<HTMLInputElement> | undefined
  ) => {
    setState((prev) => ({ ...prev, boardNewName: event?.target.value }));
  };

  const onEnterRenameBoard = (boardID: React.Key) => {
    if (boardNewName !== "") {
      dispatch(
        updateBoard({ id: boardID, updatedBoard: { name: boardNewName } })
      );
      updateBoardAPI(boardID, { name: boardNewName });
    }
    setState((prev) => ({ ...prev, isRename: false, groupNewName: "" }));
  };

  // Handle "DELETE"
  const onConfirmDeleteBoard = async (boardID: React.Key) => {
    try {
      const deletedBoard = await deleteBoardAPI(boardID as string);
      dispatch(deleteBoard({ id: boardID }));
      dispatch(reorderBoardAsync());
      messageCreate.open({
        type: "success",
        content: "Board deleted!",
      });
      navigate("/dashboard/board");
    } catch (error) {
      messageCreate.open({
        type: "error",
        content: error as string,
      });
    }
  };

  // Lists
  const breadcrumbItems = [
    { title: "Dashboard" },
    { title: DASHBOARD_NAME[selectedKey] },
  ];

  const dashBoardItems: MenuItem[] = [
    {
      key: DASHBOARD_KEY.HOME,
      icon: <HomeIcon />,
      label: <NavLink to={DASHBOARD_KEY.HOME}>{"Home"}</NavLink>,
    },
    {
      key: DASHBOARD_KEY.BOARD,
      icon: <DataIcon />,
      label: <NavLink to={DASHBOARD_KEY.BOARD}>{"Board List"}</NavLink>,
      children: [
        {
          key: DASHBOARD_KEY.OWNED,
          label: "Your Boards",
          children: [
            ...ownedBoardList.map((board) => ({
              label: (
                <div onClick={() => onClickSelectBoard(board.id)}>
                  {isRename && objectSelected === (board.id as string) ? (
                    <Input
                      className="w-full h-full p-0"
                      style={{
                        boxShadow: "none",
                        borderColor: "transparent",
                        backgroundColor: "transparent",
                      }}
                      autoFocus={true}
                      value={boardNewName}
                      onChange={onChangeBoardNewName}
                      onPressEnter={() => onEnterRenameBoard(board.id)}
                      onBlur={(e) => {
                        onEnterRenameBoard(board.id);
                      }}
                    />
                  ) : (
                    <div className="flex flex-row justify-between items-center h-full">
                      <Typography.Text
                        ellipsis={{
                          tooltip: { placement: "right" },
                        }}
                      >
                        {board.name}
                      </Typography.Text>

                      <Dropdown
                        key={board.id}
                        menu={{
                          items: boardActionItems,
                          onClick: (event) =>
                            onClickAction(event, board.id, board.name),
                        }}
                        placement="bottomLeft"
                        open={
                          isOpenBoardMenu &&
                          (board.id as string) === objectSelected
                        }
                        trigger={["click"]}
                        onOpenChange={(visible) => {
                          if (!visible) {
                            onClickHideBoardMenu();
                          }
                        }}
                      >
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            onClickShowBoardMenu(board.id);
                          }}
                        >
                          <MoreIcon />
                        </div>
                      </Dropdown>
                    </div>
                  )}
                </div>
              ),
              key: board.id,
            })),
            ...[
              {
                key: "add",
                label: isAdding ? (
                  <div className="mb-2 w-full h-8">
                    <Input
                      className="flex flex-row !px-0 !py-[10px] w-full !border-none !shadow-none !outline-none !bg-transparent "
                      placeholder="Input board's name"
                      value={inputBoardName}
                      onChange={onChangeInputBoard}
                      onPressEnter={onClickAddBoard}
                      autoFocus={true}
                      onBlur={onClickAddBoard}
                    />
                    {/* <div className="p-[10px] w-full text-[#595959]">
                      Press Enter to create new board
                    </div> */}
                  </div>
                ) : (
                  <Button
                    onClick={onClickBeginAddingBoard}
                    type="link"
                    className="flex justify-start w-full bg-transparent border-none shadow-none outline-none text-left p-0"
                  >
                    <AddIcon />
                    Add new board
                  </Button>
                ),
              },
            ],
          ],
        },
        {
          key: DASHBOARD_KEY.SHARED,
          label: "Shared with you",
          children: sharedBoardList.map((board) => ({
            label: (
              <div onClick={() => onClickSelectBoard(board.id)}>
                {isRename && objectSelected === (board.id as string) ? (
                  <Input
                    className="w-full h-full p-0 border-none"
                    style={{
                      boxShadow: "none",
                      borderColor: "transparent",
                      backgroundColor: "transparent",
                    }}
                    autoFocus={true}
                    value={boardNewName}
                    onChange={onChangeBoardNewName}
                    onPressEnter={() => onEnterRenameBoard(board.id)}
                    onBlur={(e) => {
                      onEnterRenameBoard(board.id);
                    }}
                  />
                ) : (
                  <div className="flex flex-row justify-between items-center h-full">
                    <Typography.Text
                      ellipsis={{
                        tooltip: { placement: "right" },
                      }}
                    >
                      {board.name}
                    </Typography.Text>

                    <Dropdown
                      key={board.id}
                      menu={{
                        items: boardActionItems,
                        onClick: (event) =>
                          onClickAction(event, board.id, board.name),
                      }}
                      placement="bottomLeft"
                      open={
                        isOpenBoardMenu &&
                        (board.id as string) === objectSelected
                      }
                      trigger={["click"]}
                      onOpenChange={(visible) => {
                        if (!visible) {
                          onClickHideBoardMenu();
                        }
                      }}
                    >
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          onClickShowBoardMenu(board.id);
                        }}
                      >
                        <MoreIcon />
                      </div>
                    </Dropdown>
                  </div>
                )}
              </div>
            ),
            key: board.id,
          })),
        },
      ],
    },
  ];

  // Utils
  const levelKeys = getDashBoardLevelKeys(dashBoardItems as LevelKeysProps[]);
  const pathList = getParentKeys(dashBoardItems as LevelKeysProps[]);

  const onOpenChange: MenuProps["onOpenChange"] = (openKeys) => {
    const currentOpenKey = openKeys.find((key) => openList.indexOf(key) === -1);

    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
      .filter((key) => key !== currentOpenKey)
      .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

      setState((prev) => ({
        ...prev,
        openList: openKeys
          .filter((_, index) => index !== repeatIndex)
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey]),
      }));
    } else {
      setState((prev) => ({ ...prev, openList: openKeys }));
    }
  };

  return (
    <Layout className="h-screen">
      {contextHolder}
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        width={"15vw"}
        style={{
          boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)",
          zIndex: 1000,
        }}
        className="h-screen"
      >
        <div className="flex flex-col w-full overflow-auto h-full">
          <div className="flex flex-row items-center justify-center w-full h-16 p-2 my-3 sticky">
            <img className="h-10" src={logo} alt="logo" />
            <div> TO DO APP </div>
          </div>

          <div className="flex-grow flex flex-col h-full w-full overflow-auto gap-1">
            <div className="flex flex-col w-full overflow-auto h-full">
              <Menu
                mode="inline"
                defaultSelectedKeys={[DASHBOARD_KEY.HOME]}
                //defaultOpenKeys={[DASHBOARD_KEY.HOME]}
                selectedKeys={[objectSelected]}
                // onClick={onClick}
                openKeys={openList}
                onOpenChange={onOpenChange}
                items={dashBoardItems}
                //onSelect={(e) => console.log(e)}
                style={{ borderInlineEnd: "0px" }}
              />
            </div>
          </div>
        </div>
      </Sider>

      <ShareAccessModal
        isOpen={isSharing}
        onClose={onCloseShareAccessModal}
        object={"board"}
        objectName={boardSharedName}
        objectID={objectSelected}
        accessList={alreadySharedList}
        onShare={onShareComplete}
        permission={userPermission}
      />

      <Layout className="h-screen">
        <Header
          className="flex justify-end items-center p-5 shrink-0"
          style={{ background: colorBgContainer }}
        >
          <div className="flex items-center mr-1">
            <SettingIcon
              className="mr-4"
              style={{ fontSize: "22px", cursor: "pointer" }}
            />
            <Avatar
              size={30}
              icon={<UserIcon />}
              onClick={onClickShowUserSetting}
              style={{ cursor: "pointer" }}
            />
          </div>
        </Header>
        <Content
          className="px-10 py-2 flex flex-col h-full w-full overflow-auto"
          style={{
            background: colorBgContainer,
          }}
        >
          <div className="mb-10 sticky">
            <div className="font-black align-bottom text-3xl">{title}</div>
            <Breadcrumb
              items={[
                {
                  title: "Dashboard",
                },
                {
                  title: DASHBOARD_NAME[selectedKey],
                  href: `/dashboard/${selectedKey}`,
                },
                ...selectedPath,
              ]}
              className="mt-5 text-sm"
            />
          </div>
          <Outlet />
        </Content>

        {isOpenSetting && (
          <UserDrawer isOpen={isOpenSetting} onClose={onCloseUserSetting} />
        )}
      </Layout>
    </Layout>
  );
};
