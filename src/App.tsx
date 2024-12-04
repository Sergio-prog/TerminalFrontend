import { Routes, Route } from 'react-router-dom'
import TelegramMiniApp from './pages/TelegramMiniApp'

function App() {
    return (
        <Routes>
            <Route path="/" element={<TelegramMiniApp />} />
        </Routes>
    )
}

export default App 