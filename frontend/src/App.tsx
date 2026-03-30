import { Routes, Route, Navigate } from 'react-router-dom'
import { BookingFormPage }    from './pages/BookingFormPage'
import { BookingSuccessPage } from './pages/BookingSuccessPage'

function App() {
  return (
    <Routes>
      <Route path="/"        element={<BookingFormPage />} />
      <Route path="/success" element={<BookingSuccessPage />} />
      <Route path="*"        element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
