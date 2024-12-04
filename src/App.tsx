import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import TelegramMiniApp from './pages/TelegramMiniApp';

const App = () => {
    const location = useLocation();

    useEffect(() => {
        if (typeof window.gtag === 'function') {
            window.gtag('config', 'G-2J1EHL03SV', {
                page_path: location.pathname,
            });
        }
    }, [location]);

    return (
        <Routes>
            <Route path="/" element={<TelegramMiniApp />} />
        </Routes>
    );
};

export default App;
