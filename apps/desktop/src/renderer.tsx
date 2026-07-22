import { createRoot } from 'react-dom/client';

import { App } from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Не найден корневой DOM-узел приложения.');
}

createRoot(rootElement).render(<App />);
