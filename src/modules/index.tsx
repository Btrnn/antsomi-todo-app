// Libraries
import React from "react";
import { RouterProvider } from "react-router-dom";

// Routes
import { router } from "../routes";
import { AntdConfigProvider } from "providers";

function App() {
  return (
    <AntdConfigProvider>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </AntdConfigProvider>
  );
}

export default App;
