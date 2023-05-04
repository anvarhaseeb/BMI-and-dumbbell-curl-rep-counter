import React from 'react'
import ReactDOM from 'react-dom/client'
import { Home } from './pages/Home';
import { Login } from "./pages/Login";
import { Trainer } from "./pages/Trainer"
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
const router = createBrowserRouter([{
  path: "/",
  element: <Login />,
}, {
  path: "home",
  element: <Home />,
},
{
  path: "trainer",
  element: <Trainer />,
},
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
