import { SOCKET_QUERY_KEY } from 'constant';
import { Cookies } from 'react-cookie';
import { io, Socket } from 'socket.io-client';
import { IdentifyId, ObjectRequest } from 'types';

const SOCKET_URL = 'http://localhost:4000';

// export const socket: Socket = io(SOCKET_URL, {
//   autoConnect: true,
//   transports: ['websocket'],
//   //extraHeaders: authToken ? { Authorization: `Bearer ${authToken}` } : {},
//   //withCredentials: true,
//   auth: {
//     token: authToken || '',
//   },
// });

export const createSocket = (
  namespace: string,
  objectID: IdentifyId,
  objectType: string,
): Socket => {
  const cookies = new Cookies();
  const authToken = cookies.get('authToken');
  const object: ObjectRequest = {
    id: objectID,
    type: objectType,
  };

  if (namespace) {
    const CONNECT_URL = `${SOCKET_URL}/${namespace}`;
    return io(CONNECT_URL, {
      //autoConnect: true,
      //transports: ['websocket'],
      extraHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
      query: {
        [SOCKET_QUERY_KEY.OBJECT]: JSON.stringify(object),
      },
    });
  }
  return io();
};
