import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Layout from './components/layout/Layout'

// Pages
import HomePage          from './pages/HomePage'
import LoginPage         from './pages/LoginPage'
import RegisterPage      from './pages/RegisterPage'
import RestaurantsPage   from './pages/RestaurantsPage'
import RestaurantDetail  from './pages/RestaurantDetailPage'
import RestaurantCreate  from './pages/RestaurantCreatePage'
import BookingPage       from './pages/BookingPage'
import MyBookingsPage    from './pages/MyBookingsPage'
import DashboardPage     from './pages/DashboardPage'
import AdminPage         from './pages/AdminPage'
import NotFoundPage      from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          {/* Public */}
          <Route element={<Layout />}>
            <Route path="/"              element={<HomePage />} />
            <Route path="/login"         element={<LoginPage />} />
            <Route path="/register"      element={<RegisterPage />} />
            <Route path="/restaurants"   element={<RestaurantsPage />} />
            <Route path="/restaurants/:id" element={<RestaurantDetail />} />

            {/* Customer */}
            <Route element={<ProtectedRoute roles={['ROLE_CUSTOMER','ROLE_ADMIN']} />}>
              <Route path="/book/:restaurantId" element={<BookingPage />} />
              <Route path="/my-bookings"        element={<MyBookingsPage />} />
            </Route>

            {/* Owner + Admin */}
            <Route element={<ProtectedRoute roles={['ROLE_OWNER','ROLE_ADMIN']} />}>
              <Route path="/restaurants/new" element={<RestaurantCreate />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Admin only */}
            <Route element={<ProtectedRoute roles={['ROLE_ADMIN']} />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*"    element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  )
}
