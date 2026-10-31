import { useRoutes } from 'react-router-dom';
import { routes } from '../routes/index';
import DemoRoleSwitcher from '../components/DemoRoleSwitcher';

export default function App() {
  const element = useRoutes(routes);

  return (
    <>
      {element}
      {/* Demo role switcher — TODO(A): Remove in production */}
      <DemoRoleSwitcher />
    </>
  );
}
