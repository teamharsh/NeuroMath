import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { ToastProvider } from "@/components/ui/toast";

import Welcome from "@/screens/welcome";
import Calculate from "@/screens/calculate";
import NotFound from "@/screens/not-found";

import "@/index.css";

const paths = [
  {
    path: "/",
    element: <Welcome />,
  },
  {
    path: "/calculate",
    element: <Calculate />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

const BrowserRouter = createBrowserRouter(paths);

const App = () => {
  return (
    <MantineProvider>
      <ToastProvider>
        <RouterProvider router={BrowserRouter} />
      </ToastProvider>
    </MantineProvider>
  );
};

export default App;
