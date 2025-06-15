import { createBrowserRouter  } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
        ],
        errorElement: <NotFound />,
    },
]);

export default router;