// Libraries
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Modules
import { Login } from '../modules/Login';
import { Dashboard } from '../modules/Dashboard';
import { Tasks } from 'modules/Dashboard/Tasks';
import { Home } from 'modules/Dashboard/Home';
import { About } from 'modules/About';
import { NotFound } from 'modules/NotFound';
import { Setting } from 'modules/Dashboard/Setting';
import { Profile } from 'modules/Dashboard/Profile';
import { Signup } from 'modules/Signup';

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
    element: <Profile />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
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
        path: 'tasks',
        element: <Tasks />,
      },
    ],
  },
]);
