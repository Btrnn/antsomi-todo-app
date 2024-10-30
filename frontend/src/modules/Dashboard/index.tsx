// Libraries
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

// Images
import logo from "../../assets/images/logo.png";

// Icons
import {
  AddIcon,
  DataIcon,
  DeleteIcon,
  EditIcon,
  HomeIcon,
  MoreIcon,
  SettingIcon,
  ShareIcon,
  UserIcon,
} from "components/icons";

// Components
import {
  Avatar,
  Breadcrumb,
  Button,
  Dropdown,
  Input,
  Layout,
  LevelKeysProps,
  Menu,
  type MenuInfo,
  type MenuProps,
  message,
  Modal,
  Typography,
} from "components/ui";
import { UserDrawer } from "../../components/common";

// Constants
import {
  DASHBOARD_KEY,
  DASHBOARD_NAME,
  globalToken,
  MENU_KEY,
  OBJECT_TYPE,
  PERMISSION,
  ROLE_KEY,
} from "../../constants";

// Models
import { Board } from "models";

// Services
import { getAccessList, getPermission } from "services/board";

// Stores
import { AppDispatch, setPermission } from "store";

import { ShareAccessModal } from "components/common";
import { IdentifyId } from "types";
import { checkAuthority, getDashBoardLevelKeys, getParentKeys } from "utils";

// Hooks
import {
  useBoardList,
  useLoggedUser,
  useAccessList,
  usePermission,
  useDeepCompareEffect,
} from "hooks";
import { useCreateBoard, useDeleteBoard, useUpdateBoard } from "queries";

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
  currentObjectId: string;
  isAdding: boolean;
  isSharing: boolean;
  boardSharedName: string;
  shareUsers: { id: React.Key; name: string; email: string; role: string }[];
  inputUser: string;
  error: string;
  selectedRole: string;
  isAddingUser: boolean;
  isOpenBoardMenu: boolean;
  userPermission: string;
  selectedPath: { title: string }[];
  isLoading: boolean;
  openList: string[];
  targetObjectId: string;
};

type MenuItem = Required<MenuProps>["items"][number];

export const Dashboard: React.FC = () => {
  const [messageCreate, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  // Queries
  const { mutateAsync: updatedBoard, isError: isUpdateBoardError } =
    useUpdateBoard();
  const { mutateAsync: createBoard, isError: isCreateBoardError } =
    useCreateBoard();
  const { mutateAsync: deleteBoard, isError: isDeleteBoardError } =
    useDeleteBoard();

  // State
  const [state, setState] = useState<TState>({
    isOpenSetting: false,
    title: "Home",
    selectedKey: "",
    inputBoardName: "",
    isRename: false,
    boardNewName: "",
    currentObjectId: "",
    isAdding: false,
    isSharing: false,
    boardSharedName: "",
    shareUsers: [],
    inputUser: "",
    error: "",
    selectedRole: ROLE_KEY.VIEWER,
    isAddingUser: false,
    isOpenBoardMenu: false,
    userPermission: "",
    selectedPath: [],
    isLoading: true,
    openList: [],
    targetObjectId: "",
  });
  const {
    isOpenSetting,
    title,
    selectedKey,
    inputBoardName,
    boardNewName,
    isRename,
    currentObjectId,
    isAdding,
    isSharing,
    boardSharedName,
    inputUser,
    error,
    shareUsers,
    selectedRole,
    isAddingUser,
    isOpenBoardMenu,
    selectedPath,
    isLoading,
    openList,
    targetObjectId,
  } = state;

  // Store
  const dispatch: AppDispatch = useDispatch();

  // Hooks
  const location = useLocation();
  const params = useParams();
  const {
    owned: ownedBoardList,
    shared: sharedBoardList,
    isLoading: boardLoading,
    error: boardError,
    refetch: refetchBoard,
  } = useBoardList();
  const { refetch: refetchUserInfo } = useLoggedUser();
  const { accessList: alreadySharedList } = useAccessList(
    targetObjectId,
    OBJECT_TYPE.BOARD
  );
  const { permission: userPermission } = usePermission(
    currentObjectId,
    OBJECT_TYPE.BOARD
  );
  const { permission: menuPermission } = usePermission(
    targetObjectId,
    OBJECT_TYPE.BOARD
  );

  //List
  const boardActionItems: MenuItem[] = [
    ...(checkAuthority(menuPermission, PERMISSION[ROLE_KEY.EDITOR])
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
    ...(checkAuthority(menuPermission, PERMISSION.owner)
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

  // Effects
  useEffect(() => {
    refetchBoard();
    refetchUserInfo();
  }, []);

  useDeepCompareEffect(() => {
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
      openList.push(DASHBOARD_KEY.BOARD);
      if (params.boardId) {
        openList =
          pathList.find((path) => path.key === params.boardId)?.path || [];
      }
      currentKey = DASHBOARD_KEY.BOARD;
      currentTitle =
        [...ownedBoardList, ...sharedBoardList].find(
          (board) => board.id === params?.boardId
        )?.name ?? "Board List";
    }

    setState((prevState) => ({
      ...prevState,
      title: currentTitle,
      selectedKey: params.boardId ?? currentKey,
      currentObjectId: params?.boardId ?? currentKey,
      selectedPath: isSubMenu ? [{ title: currentTitle }] : [],
      openList: openList,
    }));
  }, [location, boardLoading, ownedBoardList, sharedBoardList]);

  // Handles
  const onClickSelectBoard = async (objectID: IdentifyId) => {
    try {
      //const userPermission = await getPermission(objectID);
      navigate(`/dashboard/board/${objectID}`);
      // setState((prev) => ({
      //   ...prev,
      //   userPermission: userPermission.data,
      // }));
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
      targetObjectId: objectID as string,
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
          createBoard(newBoard);
          if (!isCreateBoardError) {
            messageCreate.open({
              type: "success",
              content: <div>New board added!</div>,
            });
          } else {
            messageCreate.open({
              type: "error",
              content: "Cannot add board",
            });
          }
        } catch (error) {}
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
      setState((prev) => ({
        ...prev,
        isSharing: true,
        //currentObjectId: boardID as string,
        boardSharedName: boardName,
        targetObjectId: boardID as string,
      }));

      // messageCreate.open({
      //   type: "error",
      //   content: error as string,
      // });
    }
  };

  // Handle "SHARE"
  const onCloseShareAccessModal = async () => {
    setState((prev) => ({
      ...prev,
      //currentObjectId: "",
      boardSharedName: "",
      isSharing: false,
    }));
  };

  // const onShareComplete = async () => {
  //   try {
  //     const accessList = await getAccessList(currentObjectId, OBJECT_TYPE.BOARD);
  //   } catch (error) {
  //     messageCreate.open({
  //       type: "error",
  //       content: error as string,
  //     });
  //   }
  // };

  // Handle "RENAME"
  const onClickBeginRenaming = (objectID: React.Key, objectName: string) => {
    setState((prev) => ({
      ...prev,
      isRename: true,
      targetObjectId: objectID as string,
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
      const boardExists = ownedBoardList.some(
        (board) => board.name === boardNewName && board.id !== boardID
      );
      if (boardExists) {
        messageCreate.open({
          type: "error",
          content: "This board's name already exists!",
        });
      } else {
        updatedBoard({ board: { id: boardID, name: boardNewName } });
        if (!isUpdateBoardError) {
          messageCreate.open({
            type: "success",
            content: "Board updated",
          });
          setState((prev) => ({ ...prev, isRename: false, groupNewName: "" }));
        } else {
          messageCreate.open({
            type: "error",
            content: "Cannot update board",
          });
        }
      }
    }
  };

  // Handle "DELETE"
  const onConfirmDeleteBoard = async (boardID: React.Key) => {
    try {
      deleteBoard(boardID);
      if (!isDeleteBoardError) {
        messageCreate.open({
          type: "success",
          content: "Board deleted!",
        });
        navigate("/dashboard/board");
      } else {
        messageCreate.open({
          type: "error",
          content: "Cannot delete board",
        });
      }
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
                <>
                  {isRename && targetObjectId === (board.id as string) ? (
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
                      <div className="flex w-4/5 h-full items-center" onClick={() => onClickSelectBoard(board.id)} >
                        <Typography.Text
                          ellipsis={{
                            tooltip: { placement: "right" },
                          }}
                        >
                          {board.name}
                        </Typography.Text>
                      </div>
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
                          (board.id as string) === targetObjectId
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
                </>
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
              <>
                {isRename && targetObjectId === (board.id as string) ? (
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
                    <div className="flex w-4/5 h-full items-center" onClick={() => onClickSelectBoard(board.id)} >
                    <Typography.Text
                      ellipsis={{
                        tooltip: { placement: "right" },
                      }}
                    >
                      {board.name}
                    </Typography.Text>
                    </div>

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
                        (board.id as string) === targetObjectId
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
              </>
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
                selectedKeys={[currentObjectId]}
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
        objectType={OBJECT_TYPE.BOARD}
        objectName={boardSharedName}
        objectID={targetObjectId}
        accessList={alreadySharedList}
        //onShare={onShareComplete}
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
