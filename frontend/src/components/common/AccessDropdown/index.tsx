// Libraries
import React, { useEffect, useMemo, useState } from 'react';

// Components
import { Select, Typography } from '../../ui';
import { DeleteIcon, SwitchUserIcon } from '../../icons';

// Constants
import { PERMISSION, ROLE_KEY, ROLE_OPTIONS } from 'constants/role';

// Utils
import { checkAuthority } from 'utils';

interface AccessDropDownProp {
  onSelect: (role: string) => void;
  permission: string;
  currentRole: string;
  disable: boolean;
  isAbleToChangeOwnerAndDelete: boolean;
  onEnter: () => void;
}

const { Text } = Typography;

type TState = {
  selectedRole: string;
};

export const AccessDropDown: React.FC<AccessDropDownProp> = props => {
  const { onSelect, permission, currentRole, disable, isAbleToChangeOwnerAndDelete, onEnter } =
    props;

  // States
  const [state, setState] = useState<TState>({
    selectedRole: currentRole,
  });
  const { selectedRole } = state;

  // Effects
  useEffect(() => {
    setState(prev => ({
      ...prev,
      selectedRole: currentRole,
    }));
  }, [currentRole]);

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
  const onChangeRole = (value: string) => {
    onSelect(value);
  };

  const onPressKey = (event: React.KeyboardEvent<HTMLDivElement> | undefined) => {
    if (event?.key === 'Enter') {
      onEnter();
    }
  };

  //   const onChangeRoleExistedList = (value: string, index: number) => {
  //     if (value === 'delete') {
  //       Modal.confirm({
  //         title: "Are you sure you want to remove this user's access?",
  //         content: (
  //           <div className="text-red-500 text-xs">
  //             Removing this user&apos;s access will revoke their permissions to this board.
  //           </div>
  //         ),

  //         footer: (_, { OkBtn, CancelBtn }) => (
  //           <>
  //             <CancelBtn />
  //             <OkBtn />
  //           </>
  //         ),
  //         onOk: () => onDelete(),
  //       });
  //     } else if (value === 'change owner') {
  //       Modal.confirm({
  //         title: 'Are you sure you want to transfer your ownership?',
  //         content: (
  //           <div className="text-red-500 text-xs">
  //             This action will grant full control to the new owner, including permissions and
  //             responsibilities.
  //           </div>
  //         ),

  //         footer: (_, { OkBtn, CancelBtn }) => (
  //           <>
  //             <CancelBtn />
  //             <OkBtn />
  //           </>
  //         ),
  //         onOk: () => onChangeOwner(),
  //       });
  //     } else {
  //       setState(prev => ({
  //         ...prev,
  //         alreadySharedList: alreadySharedList.map((user, i) =>
  //           i === index ? { ...user, permission: value } : user,
  //         ),
  //       }));
  //     }
  //   };

  return (
    <Select
      onKeyDown={onPressKey}
      className="w-[110px] shrink-0"
      value={selectedRole}
      //virtual={false}
      disabled={disable}
      onChange={onChangeRole}
      options={[
        ...roleOptions,
        ...(isAbleToChangeOwnerAndDelete
          ? [
              ...(checkAuthority(permission, PERMISSION.owner)
                ? [
                    {
                      value: 'change owner',
                      Icon: SwitchUserIcon,
                      label: 'Change owner',
                    },
                  ]
                : []),
              {
                value: 'delete',
                Icon: DeleteIcon,
                className: 'text-red-500',
                label: 'Delete Access',
              },
            ]
          : []),
      ]}
      optionRender={option => {
        const { Icon, label, className } = (option.data as any) || {};
        return (
          <Text ellipsis={{ tooltip: { placement: 'left' } }} className={`${className} w-full`}>
            {Icon ? <Icon className="mr-2 my-2 shrink-0" /> : null}
            {label}
          </Text>
        );
      }}
    />
    // <Select
    //   className="w-[120px] shrink-0"
    //   value={selectedRole}
    //   onChange={onChangeRole}
    //   options={roleOptions}
    //   optionRender={option => {
    //     const { Icon, label, className } = (option.data as any) || {};

    //     return (
    //       <Text ellipsis={{ tooltip: true }} className={`${className} w-full`}>
    //         {Icon ? <Icon className="mr-2 my-2 shrink-0" /> : null}
    //         {label}
    //       </Text>
    //     );
    //   }}
    // />
  );
};
