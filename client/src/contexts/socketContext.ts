import React from 'react';
import { Socket, io } from 'socket.io-client';
import { API_URL } from '../globals/constants';

const socket: Socket = io( API_URL + '/salmong', { autoConnect: false } );
export const SocketContext = React.createContext<Socket | undefined>( socket );
