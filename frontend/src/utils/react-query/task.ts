// Libraries
import { nanoid } from 'nanoid';
import { cloneDeep } from 'lodash';

// Models
import { Task, Group } from 'models';

// Types
import { ServiceResponse } from 'types';

type PersistTaskMutateParams = {
  taskId?: Task['id'];
  positions?: { id: Task['id']; position: number }[];
  task?: Partial<Task>;
  groupId?: Group['id'];
  oldData: ServiceResponse<Task[]>;
};

export const persistTaskMutate = ({
  task,
  taskId,
  groupId,
  positions,
  oldData,
}: PersistTaskMutateParams) => {
  if (!oldData) {
    return oldData;
  }
  const cloneOldData = cloneDeep(oldData);

  // Case reorder, positions is exists
  if (positions) {
    // cloneOldData.data = cloneOldData.data
    //   .map(task => {
    //     const updatedPosition = positions.find(pos => pos.id === task.id);
    //     return updatedPosition ? { ...task, position: updatedPosition.position } : task;
    //   })
    //   .sort((a, b) => a.position - b.position);
  } else if (groupId) {
    // Case delete by groupId, groupId is exists
    cloneOldData.data = cloneOldData.data.filter(b => b.status_id !== groupId);
  } else {
    // Case create, taskId is exists
    if (!taskId) {
      cloneOldData?.data?.push({
        id: nanoid(),
        ...task,
      } as Task);
    } else {
      if (!task) {
        //Case Delete: taskId is exists, task isn't exists
        cloneOldData.data = cloneOldData.data.filter(b => b.id !== taskId);
      } else {
        //Case Update: boardId, board is exists
        const { id, ...restOfTask } = task || {};

        cloneOldData.data?.some(task => {
          if (task.id === id) {
            Object.assign(task, restOfTask);
            return true;
          }
          return false;
        });
      }
    }
  }
  return cloneOldData;
};
