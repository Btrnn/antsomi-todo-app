// Libraries
import { Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store';

// Routes
import { router } from '../routes';
import { AntdConfigProvider, ReactQueryClientProvider } from 'providers';

// Hooks
import { useAuth } from 'hooks';

function App() {
  const { loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [authLoading]);

  return (
    <Provider store={store}>
      {loading && (
        <div className="fixed h-screen w-screen bg-white flex items-center justify-center z-10">
          <Spin spinning />
        </div>
      )}
      <ReactQueryClientProvider>

      <AntdConfigProvider>
        <div className="App">
          <RouterProvider router={router} />
        </div>
      </AntdConfigProvider>
        </ReactQueryClientProvider>
    </Provider>
  );
}

export default App;
