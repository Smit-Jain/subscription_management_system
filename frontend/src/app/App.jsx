import { useRoutes } from 'react-router-dom';
import { routes } from '../routes/index';

export default function App() {
  const element = useRoutes(routes);
  return element;
}
