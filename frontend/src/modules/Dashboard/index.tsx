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
} from "components/ui";
import { UserDrawer } from "../../components/common/UserDrawer";

// Constants
import {
  DASHBOARD_KEY,
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
import { getInfo } from "services";
import { IdentifyId } from "types";
import { ShareAccessModal } from "components/common";
import { checkAuthority } from "utils";

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
  boardSelected: string;
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
    boardSelected: "",
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
  });
  const {
    isOpenSetting,
    title,
    selectedKey,
    inputBoardName,
    boardNewName,
    isRename,
    boardSelected,
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
  } = state;

  // Store
  const dispatch: AppDispatch = useDispatch();
  const ownedBoardList = useSelector(
    (state: RootState) => state.board.ownedList
  );
  const sharedBoardList = useSelector(
    (state: RootState) => state.board.sharedList
  );

  //List
  const boardActionItems: MenuItem[] = [
    ...(checkAuthority(userPermission, PERMISSION.EDIT)
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
    ...(checkAuthority(userPermission, PERMISSION.OWN) ? [{
      label: (
        <div className="flex p-2 text-red-500">
          <DeleteIcon className="mr-3" />
          <div>Delete</div>
        </div>
      ),
      key: MENU_KEY.KEY1,
    }] : []),
  ];

  // Hooks
  const location = useLocation();
  const params = useParams();

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
    if (pathname.includes("/board")) {
      currentTitle = "Task List";
      currentKey = DASHBOARD_KEY.TASKS;
    } else if (pathname.includes("/home")) {
      currentTitle = "Home";
      currentKey = DASHBOARD_KEY.HOME;
    }

    setState((prevState) => ({
      ...prevState,
      title: currentTitle,
      selectedKey: currentKey,
      boardSelected: params?.boardId ?? "",
    }));

    getBoardList();
  }, [location]);

  // Handles
  const onClickSelectBoard = async (boardID: IdentifyId) => {
    const userPermission = await getPermission(boardID);
    dispatch(setPermission(userPermission.data));
    navigate(`/dashboard/board/${boardID}`);
    setState((prev) => ({
      ...prev,
      userPermission: userPermission.data,
    }));
  };

  const onClickShowBoardMenu = async (boardID: IdentifyId) => {
    setState((prev) => ({
      ...prev,
      isOpenBoardMenu: true,
      boardSelected: boardID as string,
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

  const getBoardList = async () => {
    try {
      const ownedBoards = await getAllBoards("owned");
      const sharedBoards = await getAllBoards("shared");
      dispatch(setOwnedList(ownedBoards?.data));
      dispatch(setSharedList(sharedBoards?.data));
    } catch (error) {
      console.log(error);
    }
  };

  // Handle "ADD"
  const onChangeInputBoard = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, inputBoardName: event.target.value }));
  };

  const onClickBeginAddingBoard = () => {
    setState((prev) => ({ ...prev, isAdding: true }));
  };

  const onClickAddBoard = async () => {
    if (inputBoardName !== "") {
      const boardExists = ownedBoardList.some(board => board.name === inputBoardName);
      if (boardExists) {
        messageCreate.open({
          type: "error",
          content: "Board already exists!",
        }); 
      }
      else{
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
        getBoardList();
      } catch (error) {
        messageCreate.open({
          type: "error",
          content: error as string,
        });
      }
      setState((prev) => ({ ...prev, inputBoardName: "", isAdding: false }));
      }
    }
  };

  // const onClick: MenuProps["onClick"] = (e) => {
  //   console.log("click", e);
  // };

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
      const accessList = await getAccessList(boardID);
      setState((prev) => ({
        ...prev,
        isSharing: true,
        boardSelected: boardID as string,
        boardSharedName: boardName,
        alreadySharedList: accessList.data,
      }));
    }
  };

  // Handle "SHARE"
  const onCloseShareAccessModal = async () => {
    setState((prev) => ({
      ...prev,
      boardSelected: "",
      boardSharedName: "",
      isSharing: false,
      alreadySharedList: [],
    }));
  };

  const onShareComplete = async () => {
    const accessList = await getAccessList(boardSelected);
    setState((prev) => ({
      ...prev,
      alreadySharedList: accessList.data,
    }));
    getBoardList();
  };

  // Handle "RENAME"
  const onClickBeginRenaming = (boardID: React.Key, boardName: string) => {
    setState((prev) => ({
      ...prev,
      isRename: true,
      boardSelected: boardID as string,
      boardNewName: boardName,
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
  const dashBoardItems: MenuItem[] = [
    {
      key: DASHBOARD_KEY.HOME,
      icon: <HomeIcon />,
      label: <NavLink to={DASHBOARD_KEY.HOME}>{"Home"}</NavLink>,
    },
    {
      key: "boardList",
      icon: <DataIcon />,
      label: "Boards",
      children: [
        {
          key: "owned",
          label: "Your Boards",
          children: [
            ...ownedBoardList.map((board) => ({
              label:
                isRename && boardSelected === (board.id as string) ? (
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
                  <div
                    className="flex justify-between w-full"
                    onClick={() => onClickSelectBoard(board.id)}
                  >
                    <div className="flex overflow-hidden">{board.name}</div>

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
                        (board.id as string) === boardSelected
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
          key: "shared",
          label: "Shared with you",
          children: sharedBoardList.map((board) => ({
            label:
              isRename && boardSelected === (board.id as string) ? (
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
                <div
                  className="flex justify-between w-full"
                  onClick={() => onClickSelectBoard(board.id)}
                >
                  <div className="flex overflow-hidden">{board.name}</div>

                  <Dropdown
                    key={board.id}
                    menu={{
                      items: boardActionItems,
                      onClick: (event) =>
                        onClickAction(event, board.id, board.name),
                    }}
                    placement="bottomLeft"
                    open={
                      isOpenBoardMenu && (board.id as string) === boardSelected
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
              ),
            key: board.id,
          })),
        },
      ],
    },
  ];

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
                defaultSelectedKeys={[boardSelected]}
                // onClick={onClick}
                items={dashBoardItems}
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
        objectID={boardSelected}
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
          <div className="mb-10">
            <div className=" font-black align-bottom text-3xl">{title}</div>
            <Breadcrumb
              items={[{ title: "Home" }, { title: "Task List" }]}
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
