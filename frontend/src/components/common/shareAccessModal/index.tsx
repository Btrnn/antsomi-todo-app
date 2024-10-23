// Libraries
import React, { useEffect, useMemo, useState } from 'react';

// Components
import { Modal, Input, List, Select, message, Tag, AutoComplete, Typography } from '../../ui';
import { AddIcon, CloseIcon, DeleteIcon, SwitchUserIcon } from '../../icons';

// Constants
import { PERMISSION, ROLE_KEY, ROLE_OPTIONS } from 'constants/role';
import {
  changeBoardOwner,
  deleteAccessBoard,
  getAllUsers,
  getInfo,
  shareBoard,
  updateAccessBoard,
} from 'services';

// Utils
import { checkAuthority } from 'utils';

// Hooks
import { useLoggedUser, useUserList } from 'hooks';
import { AccessDropDown } from '../AccessDropdown';

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

const { Text } = Typography;

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
  isSearching: boolean;
  objectOwner: { id: React.Key; name: string; email: string };
};

export const ShareAccessModal: React.FC<ShareAccessProp> = props => {
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

  // Hooks
  const { user: currentUser } = useLoggedUser();
  const { list: userList } = useUserList();

  // States
  const [state, setState] = useState<TState>({
    shareUsers: [],
    inputUser: '',
    error: '',
    selectedRole: ROLE_KEY.VIEWER,
    alreadySharedList: accessList,
    isSearching: false,
    isAddingUser: false,
    objectOwner: { id: '', name: 'Unknown', email: '' },
  });

  const {
    shareUsers,
    inputUser,
    error,
    selectedRole,
    alreadySharedList,
    isAddingUser,
    objectOwner,
    isSearching,
  } = state;

  // Effects
  useEffect(() => {
    setState(prev => ({
      ...prev,
      objectOwner: accessList[0],
      alreadySharedList: accessList,
    }));
  }, [accessList]);

  // Memo
  const roleOptions = useMemo(() => {
    return Object.values(ROLE_OPTIONS)
      .map(({ value, label, Icon }) => {
        return PERMISSION[value as string]?.includes(permission)
          ? {
              value,
              Icon,
              label,
            }
          : {};
      })
      .filter(option => Object.keys(option).length > 0);
  }, [permission]);

  // Handles
  const onClickBeginSharing = () => {
    setState(prev => ({ ...prev, isAddingUser: true }));
  };

  const onChangeSearchInputUser = (event: string) => {
    setState(prev => ({ ...prev, inputUser: event }));
  };

  const onSelectInputUser = (event: string) => {
    setState(prev => ({ ...prev, inputUser: event, error: '' }));
  };

  const onClickAddUser = async () => {
    setState(prev => ({
      ...prev,
      isSearching: false,
    }));
    if (inputUser) {
      try {
        const userInfo = await getInfo(inputUser);
        const isExisted = [...shareUsers, ...alreadySharedList].find(
          user => user.id === userInfo.data.id,
        );
        if (isExisted) {
          setState(prev => ({
            ...prev,
            error: 'User already added.',
          }));
        } else if (userInfo.data.id === objectOwner.id) {
          setState(prev => ({
            ...prev,
            error: "This is board's owner.",
          }));
        } else {
          if (userInfo.data) {
            setState(prev => ({
              ...prev,
              shareUsers: [
                ...shareUsers,
                {
                  id: userInfo.data.id ?? '',
                  name: userInfo.data.name ?? '',
                  email: inputUser,
                  role: selectedRole,
                },
              ],
              error: '',
              inputUser: '',
              isSearching: false,
              isAddingUser: true,
            }));
          }
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error as string,
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        error: 'This field is required !',
      }));
    }
  };

  const onClickRemoveUser = (id: React.Key) => {
    setState(prev => ({
      ...prev,
      shareUsers: shareUsers.filter(user => user.id !== id),
    }));
  };

  const onChangeRole = (value: string) => {
    setState(prev => ({
      ...prev,
      selectedRole: value,
    }));
  };

  const onChangeRoleAddingList = (value: string, index: number) => {
    setState(prev => ({
      ...prev,
      shareUsers: shareUsers.map((user, i) => (i === index ? { ...user, role: value } : user)),
    }));
  };

  const onConfirmDeleteAccess = async (userID: React.Key) => {
    try {
      const deletedAccess = await deleteAccessBoard(objectID as string, userID);
      setState(prev => ({
        ...prev,
        alreadySharedList: alreadySharedList.filter(user => user.id !== userID),
      }));
      messageCreate.open({
        type: 'success',
        content: "User's access removed.",
      });
      if (currentUser?.id === userID) {
        onClose();
      }
    } catch (error) {
      messageCreate.open({
        type: 'error',
        content: error as string,
      });
    }
  };

  const onClickStartSearchInputUser = () => {
    setState(prev => ({ ...prev, isSearching: true }));
  };

  const onConfirmChangeOwner = async (userID: React.Key) => {
    try {
      const changeOwner = await changeBoardOwner(objectID as string, userID);
      onShare();
      messageCreate.open({
        type: 'success',
        content: "Board's owner changed.",
      });
    } catch (error) {
      messageCreate.open({
        type: 'error',
        content: error as string,
      });
    }
  };

  const onChangeRoleExistedList = (value: string, index: number) => {
    if (value === 'delete') {
      Modal.confirm({
        title: "Are you sure you want to remove this user's access?",
        content: (
          <div className="text-red-500 text-xs">
            Removing this user&apos;s access will revoke their permissions to this board.
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
    } else if (value === 'change owner') {
      Modal.confirm({
        title: 'Are you sure you want to transfer your ownership?',
        content: (
          <div className="text-red-500 text-xs">
            This action will grant full control to the new owner, including permissions and
            responsibilities.
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
      setState(prev => ({
        ...prev,
        alreadySharedList: alreadySharedList.map((user, i) =>
          i === index ? { ...user, permission: value } : user,
        ),
      }));
    }
  };

  const onClickShareAccess = async (boardID: React.Key) => {
    if (isAddingUser) {
      const listUser = shareUsers.map(user => ({
        user_id: user.id,
        permission: user.role,
      }));
      if (listUser.length !== 0) {
        try {
          const response = await shareBoard(boardID, listUser);
          messageCreate.open({
            type: 'success',
            content: 'Board shared',
          });
          onShare();
        } catch (error) {
          messageCreate.open({
            type: 'error',
            content: error as string,
          });
        }
      }
      setState(prev => ({
        ...prev,
        inputUser: '',
        shareUsers: [],
        error: '',
        selectedRole: ROLE_KEY.VIEWER,
        isAddingUser: false,
      }));
    } else {
      const updateList = alreadySharedList.splice(1).map(user => ({
        user_id: user.id,
        permission: user.permission,
      }));
      if (updateList.length !== 0) {
        try {
          const response = await updateAccessBoard(boardID, updateList);
          messageCreate.open({
            type: 'success',
            content: 'Board updated',
          });
          onShare();
        } catch (error) {
          messageCreate.open({
            type: 'error',
            content: error as string,
          });
        }
      }
      onClose();
    }
  };

  const onCancelShareAccess = async () => {
    if (isAddingUser) {
      setState(prev => ({
        ...prev,
        inputUser: '',
        shareUsers: [],
        error: '',
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
              <span className="font-bold">&quot;{objectName}&quot;</span>
            </div>
            {checkAuthority(permission, PERMISSION[ROLE_KEY.VIEWER]) && (
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
        okText={isAddingUser ? 'Share' : 'Save'}
        cancelText={isAddingUser ? 'Back' : 'Cancel'}
        width={'700px'}
      >
        <div className="h-[500px] w-full mt-5 overflow-hidden">
          {isAddingUser ? (
            <div className="w-full">
              <div className="flex flex-row gap-1 w-full h-full">
                <AutoComplete
                  className="w-full h-full"
                  searchValue={inputUser}
                  onSearch={onChangeSearchInputUser}
                  onSelect={onSelectInputUser}
                  value={inputUser}
                  filterOption={(inputUser, option) => {
                    if (!option) {
                      return false;
                    }
                    return option.value.toUpperCase().indexOf(inputUser.toUpperCase()) !== -1;
                  }}
                  options={
                    isSearching
                      ? userList.map(user => ({
                          value: user.email,
                          label: (
                            <div className="flex flex-col w-full">
                              <span className="font-semibold">{user.name}</span>
                              <span>{user.email}</span>
                            </div>
                          ),
                        }))
                      : []
                  }
                >
                  <Input.Search
                    style={{ width: '100%' }}
                    placeholder="Enter users email to share access"
                    onPressEnter={onClickAddUser}
                    onClick={onClickStartSearchInputUser}
                  />
                </AutoComplete>
                <AccessDropDown
                  onSelect={role => {
                    onChangeRole(role);
                  }}
                  permission={permission}
                  currentRole={selectedRole}
                  disable={false}
                  isAbleToChangeOwnerAndDelete={false}
                  onEnter={() => {
                    onClickAddUser();
                  }}
                />
              </div>
              {error === '' ? (
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
                    <List.Item.Meta title={user.name} description={user.email} />
                    <AccessDropDown
                      onSelect={role => {
                        onChangeRoleAddingList(role, index);
                      }}
                      permission={permission}
                      currentRole={user.role}
                      disable={false}
                      isAbleToChangeOwnerAndDelete={false}
                      onEnter={() => {}}
                    />
                    <CloseIcon className="ml-2" onClick={() => onClickRemoveUser(user.id)} />
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <List
              header={<span className="font-bold text-lg">People with access</span>}
              className="overflow-auto h-[500px]"
              itemLayout="horizontal"
              dataSource={alreadySharedList}
              renderItem={(user, index) => (
                <List.Item className="h-full">
                  <List.Item.Meta
                    title={
                      <>
                        {user.name}{' '}
                        {user.id === (currentUser?.id as string) ? <Tag>You</Tag> : <></>}
                      </>
                    }
                    description={user.email}
                  />
                  {index === 0 ? (
                    <div className="text-[#595959] font-semibold opacity-60">
                      Board&apos;s owner
                    </div>
                  ) : (
                    <AccessDropDown
                      onSelect={role => {
                        onChangeRoleExistedList(role, index);
                      }}
                      permission={permission}
                      currentRole={user.permission}
                      disable={!checkAuthority(permission, PERMISSION[ROLE_KEY.EDITOR])}
                      isAbleToChangeOwnerAndDelete={true}
                      onEnter={() => {}}
                    />
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
