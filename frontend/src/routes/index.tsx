// Libraries
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Modules
import { Login } from '../modules/Login';
import { Dashboard } from '../modules/Dashboard';
import { Home } from 'modules/Dashboard/Home';
import { About } from 'modules/About';
import { NotFound } from 'modules/NotFound';
import { Setting } from 'modules/Dashboard/Setting';
import { Profile } from 'modules/Dashboard/Profile';
import { ProtectedRoute } from 'modules/ProtectedRoute';
import { Signup } from 'modules/SignUp';
import { Board } from 'modules/Dashboard/Board';
import { BoardList } from 'modules/Dashboard/BoardList';

export const router = createBrowserRouter([
  {
    path: '*',
    element: <NotFound />,
  },
  {
    path: '/',
    element: <About />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/setting',
    element: <Setting />,
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '*',
        index: true,
        element: <div>Route not found</div>,
      },
      {
        path: 'home',
        index: true,
        element: <Home />,
      },
      {
        path: 'board/:boardId',
        element: <Board />,
      },
      {
        path: 'board',
        element: <BoardList />,
      },
    ],
  },
]);
