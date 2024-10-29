// Libraries
import { nanoid } from 'nanoid';
import { cloneDeep } from 'lodash';

// Models
import { Group } from 'models';

// Types
import { ServiceResponse } from 'types';

type PersistGroupMutateParams = {
  groupId?: Group['id'];
  positions?: { id: Group['id']; position: number }[];
  group?: Partial<Group>;
  oldData: ServiceResponse<Group[]>;
};

export const persistGroupMutate = ({
  group,
  groupId,
  positions,
  oldData,
}: PersistGroupMutateParams) => {
  if (!oldData) {
    return oldData;
  }
  const cloneOldData = cloneDeep(oldData);

  // Case reorder, positions is exists
  if (positions) {
    cloneOldData.data = cloneOldData.data
      .map(group => {
        const updatedPosition = positions.find(pos => pos.id === group.id);
        return updatedPosition ? { ...group, position: updatedPosition.position } : group;
      })
      .sort((a, b) => a.position - b.position);
  } else {
    // Case create, groupId is exists
    if (!groupId) {
      cloneOldData?.data?.push({
        id: nanoid(),
        ...group,
      } as Group);
    } else {
      if (!group) {
        //Case Delete: groupId is exists, group isn't exists
        cloneOldData.data = cloneOldData.data.filter(b => b.id !== groupId);
      } else {
        //Case Update: boardId, board is exists
        const { id, ...restOfGroup } = group || {};

        cloneOldData.data?.some(group => {
          if (group.id === id) {
            Object.assign(group, restOfGroup);
            return true;
          }
          return false;
        });
      }
    }
  }
  return cloneOldData;
};
