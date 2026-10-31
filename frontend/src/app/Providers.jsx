import { BrowserRouter } from 'react-router-dom';
import { RoleProvider } from '../context/RoleContext';
import { ToastProvider } from '../context/ToastContext';
import App from './App';

export default function Providers() {
  return (
    <BrowserRouter>
      <RoleProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </RoleProvider>
    </BrowserRouter>
  );
}
