// Libraries
import React, { useEffect, useMemo, useState } from "react";

// Components
import { Modal, Input, List, Select, message } from "../../ui";
import {
  AddIcon,
  CloseIcon,
  ViewerIcon,
  EditorIcon,
  CommenterIcon,
  ManagerIcon,
  DeleteIcon,
  SwitchUserIcon,
} from "../../icons";

// Constants
import { PERMISSION, ROLE_KEY, ROLE_OPTIONS } from "constants/role";
import {
  changeBoardOwner,
  deleteAccessBoard,
  getAccessList,
  getInfo,
  shareBoard,
  updateAccessBoard,
} from "services";
import { on } from "events";
import { checkAuthority } from "utils";

interface ShareAccessProp {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
  object: string;
  objectName: string;
  objectID: React.Key;
  accessList: {
    id: string;
    name: string;
    email: string;
    permission: string;
  }[];
  permission: string;
}

type TState = {
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
  objectOwner: { id: React.Key; name: string; email: string };
};

export const ShareAccessModal: React.FC<ShareAccessProp> = (props) => {
  const {
    isOpen,
    onClose: onClose,
    object,
    objectName,
    objectID,
    accessList,
    onShare,
    permission,
  } = props;
  const [messageCreate, contextHolder] = message.useMessage();

  // States
  const [state, setState] = useState<TState>({
    shareUsers: [],
    inputUser: "",
    error: "",
    selectedRole: ROLE_KEY.VIEWER,
    alreadySharedList: accessList,
    isAddingUser: false,
    objectOwner: { id: "", name: "Unknown", email: "" },
  });

  // Effects
  useEffect(() => {
    console.log(permission);
    setState((prev) => ({
      ...prev,
      objectOwner: accessList[0],
      alreadySharedList: accessList,
    }));
  }, [accessList]);

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

  const {
    shareUsers,
    inputUser,
    error,
    selectedRole,
    alreadySharedList,
    isAddingUser,
    objectOwner,
  } = state;
  const onClickBeginSharing = () => {
    setState((prev) => ({ ...prev, isAddingUser: true }));
  };

  const onChangeInputUser = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, inputUser: event.target.value }));
  };

  const onClickAddUser = async () => {
    if (inputUser) {
      try {
        const userInfo = await getInfo(inputUser);
        const isExisted = [...shareUsers, ...alreadySharedList].find(
          (user) => user.id === userInfo.data.id
        );
        if (isExisted) {
          setState((prev) => ({
            ...prev,
            error: "User already added.",
          }));
        } else if (userInfo.data.id === objectOwner.id) {
          setState((prev) => ({
            ...prev,
            error: "This is board's owner.",
          }));
        } else {
          if (userInfo.data) {
            setState((prev) => ({
              ...prev,
              shareUsers: [
                ...shareUsers,
                {
                  id: userInfo.data.id ?? "",
                  name: userInfo.data.name ?? "",
                  email: inputUser,
                  role: selectedRole,
                },
              ],
              error: "",
              inputUser: "",
              isAddingUser: true,
            }));
          }
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as string,
        }));
      }
    } else {
      setState((prev) => ({
        ...prev,
        error: "This field is required !",
      }));
    }
  };

  const onClickRemoveUser = (id: React.Key) => {
    setState((prev) => ({
      ...prev,
      shareUsers: shareUsers.filter((user) => user.id !== id),
    }));
  };

  const onChangeRole = (value: string) => {
    setState((prev) => ({
      ...prev,
      selectedRole: value,
    }));
  };

  const onChangeRoleAddingList = (value: string, index: number) => {
    setState((prev) => ({
      ...prev,
      shareUsers: shareUsers.map((user, i) =>
        i === index ? { ...user, role: value } : user
      ),
    }));
  };

  const onConfirmDeleteAccess = async (userID: React.Key) => {
    try {
      const deletedAccess = await deleteAccessBoard(objectID as string, userID);
      setState((prev) => ({
        ...prev,
        alreadySharedList: alreadySharedList.filter(
          (user) => user.id !== userID
        ),
      }));
      messageCreate.open({
        type: "success",
        content: "User's access removed.",
      });
    } catch (error) {
      messageCreate.open({
        type: "error",
        content: error as string,
      });
    }
  };

  const onConfirmChangeOwner = async (userID: React.Key) => {
    try {
      const changeOwner = await changeBoardOwner(objectID as string, userID);
      onShare();
      messageCreate.open({
        type: "success",
        content: "User's access removed.",
      });
    } catch (error) {
      messageCreate.open({
        type: "error",
        content: error as string,
      });
    }
  };

  const onChangeRoleExistedList = (value: string, index: number) => {
    if (value === "delete") {
      Modal.confirm({
        title: "Are you sure you want to remove this user's access?",
        content: (
          <div className="text-red-500 text-xs">
            Removing this user&apos;s access will revoke their permissions to
            this board.
          </div>
        ),

        footer: (_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        ),
        onOk: () => onConfirmDeleteAccess(alreadySharedList[index].id),
      });
    } else if (value === "change owner") {
      Modal.confirm({
        title: "Are you sure you want to transfer your ownership?",
        content: (
          <div className="text-red-500 text-xs">
            This action will grant full control to the new owner, including
            permissions and responsibilities.
          </div>
        ),

        footer: (_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        ),
        onOk: () => onConfirmChangeOwner(alreadySharedList[index].id),
      });
    } else {
      setState((prev) => ({
        ...prev,
        alreadySharedList: alreadySharedList.map((user, i) =>
          i === index ? { ...user, permission: value } : user
        ),
      }));
    }
  };

  const onClickShareAccess = async (boardID: React.Key) => {
    if (isAddingUser) {
      const listUser = shareUsers.map((user) => ({
        user_id: user.id,
        permission: user.role,
      }));
      if (listUser.length !== 0) {
        try {
          const response = await shareBoard(boardID, listUser);
          messageCreate.open({
            type: "success",
            content: "Board shared",
          });
          onShare();
        } catch (error) {
          // messageCreate.open({
          //   type: "error",
          //   content: error as string,
          // });
          console.log(error);
        }
      }
      setState((prev) => ({
        ...prev,
        inputUser: "",
        shareUsers: [],
        error: "",
        selectedRole: ROLE_KEY.VIEWER,
        isAddingUser: false,
      }));
    } else {
      const updateList = alreadySharedList.splice(1).map((user) => ({
        user_id: user.id,
        permission: user.permission,
      }));
      if (updateList.length !== 0) {
        try {
          const response = await updateAccessBoard(boardID, updateList);
          messageCreate.open({
            type: "success",
            content: "Board updated",
          });
          onShare();
        } catch (error) {
          messageCreate.open({
            type: "error",
            content: error as string,
          });
        }
      }
      onClose();
    }
  };

  const onCancelShareAccess = async () => {
    if (isAddingUser) {
      setState((prev) => ({
        ...prev,
        inputUser: "",
        shareUsers: [],
        error: "",
        selectedRole: ROLE_KEY.VIEWER,
        isAddingUser: false,
      }));
    } else {
      onClose();
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <div className="justify-between flex items-center align-middle">
            <div className="mb-3 h-10 text-xl flex items-center">
              <span className="mr-2">Share access</span>
              <span className="font-bold">"{objectName}"</span>
            </div>
            {checkAuthority(permission, PERMISSION.EDIT) && (
              <AddIcon
                onClick={onClickBeginSharing}
                className="ml-3 mb-3 h-10 text-[20px] flex items-center"
              />
            )}
          </div>
        }
        closeIcon={false}
        open={isOpen}
        onOk={() => onClickShareAccess(objectID)}
        onCancel={onCancelShareAccess}
        okText={isAddingUser ? "Share" : "Save"}
        cancelText="Cancel"
        width={"700px"}
      >
        <div className="h-[500px] mt-5 overflow-hidden">
          {isAddingUser ? (
            <div>
              <div className="flex gap-1 flex-shrink-0 w-full h-10">
                <Input
                  className="p-2"
                  style={{
                    outline: "none",
                    boxShadow: "none",
                  }}
                  placeholder="Enter users email to share access"
                  value={inputUser}
                  onChange={onChangeInputUser}
                  onPressEnter={onClickAddUser}
                />
                <Select
                  value={selectedRole}
                  className="w-[140px] h-full"
                  onChange={onChangeRole}
                  options={roleOptions}
                />
              </div>
              {error === "" ? (
                <div className="p-[10px] w-full text-[#595959]">
                  Press Enter to add users access
                </div>
              ) : (
                <div className="text-red-500 p-[10px] w-full">{error}</div>
              )}

              <List
                header={<span className="font-bold text-lg">Sharing List</span>}
                className="overflow-auto mt-3 h-[400px]"
                itemLayout="horizontal"
                dataSource={shareUsers}
                renderItem={(user, index) => (
                  <List.Item className="h-full overflow-auto p-2">
                    <List.Item.Meta
                      title={user.name}
                      description={user.email}
                    />
                    <Select
                      value={user.role}
                      className="w-[140px] h-full mr-3"
                      onChange={(value) => onChangeRoleAddingList(value, index)}
                      options={roleOptions}
                    />
                    <CloseIcon onClick={() => onClickRemoveUser(user.id)} />
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <List
              header={
                <span className="font-bold text-lg">People with access</span>
              }
              className="overflow-auto h-[500px]"
              itemLayout="horizontal"
              dataSource={alreadySharedList}
              renderItem={(user, index) => (
                <List.Item className="h-full">
                  {index === 0 ? (
                    <>
                      <List.Item.Meta
                        title={objectOwner.name}
                        description={objectOwner.email}
                      />
                      <div className="text-[#595959] font-semibold opacity-60">
                        Board&apos;s owner
                      </div>
                    </>
                  ) : (
                    <>
                      <List.Item.Meta
                        title={user.name}
                        description={user.email}
                      />
                      <Select
                        value={user.permission}
                        className="w-[150px] h-full"
                        disabled={!checkAuthority(permission, PERMISSION.OWN)}
                        onChange={(value) =>
                          onChangeRoleExistedList(value, index)
                        }
                        options={[
                          ...roleOptions,
                          ...(checkAuthority(permission, PERMISSION.OWN)
                            ? [
                                {
                                  value: "change owner",
                                  icon: <SwitchUserIcon />,
                                  label: (
                                    <div className="my-1 font-semibold">
                                      <SwitchUserIcon className="mr-2" />
                                      Change Owner
                                    </div>
                                  ),
                                },
                              ]
                            : []),
                          {
                            value: "delete",
                            icon: <DeleteIcon />,
                            label: (
                              <div className="text-red-500 my-1">
                                <DeleteIcon className="mr-2" />
                                Delete Access
                              </div>
                            ),
                          },
                        ]}

                      />
                    </>
                  )}
                </List.Item>
              )}
            />
          )}
        </div>
      </Modal>
    </>
  );
};
