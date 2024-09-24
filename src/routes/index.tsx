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
