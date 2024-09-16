// Libraries
import React from "react";
import { RouterProvider } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from '../store';

// Routes
import { router } from "../routes";
import { AntdConfigProvider } from "providers";

function App() {
  return (
    <Provider store={store}>
      <AntdConfigProvider>
        <div className="App">
          <RouterProvider router={router} />
        </div>
      </AntdConfigProvider>
    </Provider>
  );
}

export default App;
