// Libraries
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Constants
import { QUERY_KEYS } from 'constants/query';

// Services
import { getInfo, getUserInfo } from 'services';

// Types
import { ServiceResponse } from 'types';

// Models
import { User } from 'models';

type UseGetUserInfoProps = {
  options?: UseQueryOptions<ServiceResponse<Omit<User, 'password'>>>;
};

type UseGetUserByEmailProps = {
  email?: string;
  options?: UseQueryOptions<ServiceResponse<Partial<User>>>;
};

/**
 * Get the current user's info using the `getUserInfo` service.
 *
 * @param {UseGetUserInfoProps} [props] The options for the `useQuery` hook.
 *
 * @returns {UseQueryResult<ServiceResponse<Omit<User, 'password'>>>} The result of the query.
 */
export const useGetUserInfo = (props?: UseGetUserInfoProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_INFO],
    queryFn: getUserInfo,
    ...props?.options,
  });
};

/**
 * Get a user by their email address using the `getInfo` service.
 *
 * @param {UseGetUserByEmailProps} [props] The options for the `useQuery` hook.
 *
 * @returns {UseQueryResult<ServiceResponse<Partial<User>>>} The result of the query.
 */
export const useGetUserByEmail = (props?: UseGetUserByEmailProps) => {
  const { email, options } = props || {};

  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_EMAIL, email],
    queryFn: () => getInfo(email || ''),
    ...options,
  });
};
