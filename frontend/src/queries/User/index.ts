// Libraries
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Constants
import { QUERY_KEYS } from 'constants/query';

// Services
import { getAllUsers, getInfo, getUserInfo } from 'services';

// Types
import { ServiceResponse } from 'types';

// Models
import { User } from 'models';

type UseGetUserInfoProps = {
  options?: UseQueryOptions<ServiceResponse<Omit<User, 'password'>>>;
};

type useGetUserListProps = {
  options?: UseQueryOptions<ServiceResponse<Pick<User, 'id' | 'email' | 'name'>[]>>;
};

type UseGetUserByEmailProps = {
  email?: string;
  options?: UseQueryOptions<ServiceResponse<Partial<User>>>;
};

export const useGetUserInfo = (props?: UseGetUserInfoProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_INFO],
    queryFn: getUserInfo,
    ...props?.options,
  });
};

export const useGetUserList = (props?: useGetUserListProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ALL_USERS],
    queryFn: getAllUsers,
    ...props?.options,
  });
};

export const useGetUserByEmail = (props?: UseGetUserByEmailProps) => {
  const { email, options } = props || {};

  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_EMAIL, email],
    queryFn: () => getInfo(email || ''),
    ...options,
  });
};
