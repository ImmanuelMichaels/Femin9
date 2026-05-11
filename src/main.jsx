import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { NotificationsProvider } from './pages/NotificationsContext';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './styles/globals.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <NotificationsProvider>
            <App />
          </NotificationsProvider>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);