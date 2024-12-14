import { Routes, Route } from 'react-router-dom'
import TelegramMiniApp from './pages/TelegramMiniApp'
import { QueryClient, QueryClientProvider } from "react-query"

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Routes>
                <Route path="/" element={<TelegramMiniApp />} />
            </Routes>
        </QueryClientProvider>
    )
}

export default App 