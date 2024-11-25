// Libraries
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';

// Constants
import { MUTATION_KEYS, QUERY_KEYS } from 'constant';

// Models
import { Attachment, Task } from 'models';

// Services
import { deleteFile, uploadFile } from 'services';

// Types
import { IdentifyId, ServiceResponse } from 'types';

type UseUploadFileProps = {
  id: IdentifyId;
  boardId: IdentifyId;
  type: string;
  options?: UseMutationOptions<ServiceResponse<Attachment>, Error, File>;
};

type UseDeleteFileProps = {
  id: IdentifyId;
  boardId: IdentifyId;
  type: string;
  options?: UseMutationOptions<ServiceResponse<boolean>, Error, string>;
};

export const useUploadFile = ({ id, type, boardId, options }: UseUploadFileProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.UPLOAD],
    mutationFn: newFile => uploadFile(id, type, boardId, newFile),
    onSuccess(response) {
      queryClient.setQueryData(
        [QUERY_KEYS.GET_TASK_LIST, boardId],
        (oldData: ServiceResponse<Task[]> | undefined) => {
          if (!oldData) {
            return oldData;
          }
          const updatedTasks = oldData.data.map(task => {
            if (task.id === id) {
              return {
                ...task,
                attachments: [...(task.attachments || []), response.data],
              };
            }
            return task;
          });

          return { ...oldData, data: updatedTasks };
        },
      );
      return response.data;
    },
    ...options,
  });
};

export const useDeleteFile = ({ id, type, boardId, options }: UseDeleteFileProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [MUTATION_KEYS.UPLOAD],
    mutationFn: path => deleteFile(id, type, boardId, path),
    onSuccess(data, variables) {
      queryClient.setQueryData(
        [QUERY_KEYS.GET_TASK_LIST, boardId],
        (oldData: ServiceResponse<Task[]> | undefined) => {
          if (!oldData) {
            return oldData;
          }
          const updatedTasks = oldData.data.map(task => {
            if (task.id === id) {
              return {
                ...task,
                attachments: (task.attachments || []).filter(
                  attachment => attachment.path !== variables,
                ),
              };
            }
            return task;
          });

          return { ...oldData, data: updatedTasks };
        },
      );
    },
    ...options,
  });
};
