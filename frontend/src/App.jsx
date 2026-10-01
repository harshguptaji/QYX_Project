import './App.css'
import FAQPage from './pages/FAQPage';
import HomePage from './pages/HomePage'
import {Routes, Route} from "react-router-dom";

function App() {

  return (
    <>
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/faq" element={<FAQPage />} />
    </Routes>
    </>
  )
}

export default App