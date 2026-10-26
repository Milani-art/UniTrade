import { BrowserRouter, Routes, Route, Link, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SignUp from './pages/SignUp';
import Search from './pages/Search';
import UserProfile from './pages/UserProfile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderDetails from './pages/OrderDetails';
import HelpFAQ from './pages/HelpFAQ';
import ReportListing from './pages/ReportListing';
import TermsPrivacy from './pages/TermsPrivacy';
import CreateListing from './pages/CreateListing';
import Messages from './pages/Messages';
import OrderHistory from './pages/OrderHistory';
import ListingDetails from './pages/ListingDetails';
import AdminDashboard from './pages/AdminDashboard';
import logo from './assets/logo.png';

import { Home as HomeIcon, Search as SearchIcon, ShoppingCart, CreditCard, History, HelpCircle, Flag, Shield, PlusCircle, MessageSquare, Settings } from 'lucide-react';

const navigationItems = [
  { label: 'Home', icon: HomeIcon, path: '/home' },
  { label: 'Discover', icon: SearchIcon, path: '/search' },
  { label: 'Cart', icon: ShoppingCart, path: '/cart' },
  { label: 'Checkout', icon: CreditCard, path: '/checkout' },
  { label: 'Order History', icon: History, path: '/order-history' },
  { label: 'Help & FAQ', icon: HelpCircle, path: '/help' },
  { label: 'Report Listing', icon: Flag, path: '/report-listing' },
  { label: 'Terms & Privacy', icon: Shield, path: '/terms' },
  { label: 'Create Listing', icon: PlusCircle, path: '/create-listing' },
  { label: 'Messages', icon: MessageSquare, path: '/messages' },
  { label: 'Admin', icon: Settings, path: '/admin' },
];

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activeNav, setActiveNav] = useState('Home');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  // Sync active nav with current path
  useEffect(() => {
    const path = location.pathname;
    const item = navigationItems.find(nav => nav.path === path) || (path.startsWith('/order-details/') ? { label: 'Order History' } : null);
    if (item) setActiveNav(item.label);
    
    // Redirect admin from Home to Admin Dashboard
    if (user?.role === 'ADMIN' && path === '/home') {
      navigate('/admin');
    }
  }, [location.pathname, user]);

  return (
    <div className="app">
      <aside className="sidebar">
        <Link to="/home" className="brand" onClick={() => setActiveNav('Home')}>
          <div className="brand-card">
            <img src={logo} alt="UniTrade" className="brand-logo" />
          </div>
        </Link>

        <nav className="navigation">
          {navigationItems.map((item) => {
            // Only show auth-required items if logged in
            if (!user && ['Cart', 'Checkout', 'Order History', 'Create Listing', 'Messages', 'Report Listing', 'Admin'].includes(item.label)) {
              return null;
            }
            // If user is ADMIN, only show the Admin and Messages tabs
            if (user?.role === 'ADMIN' && item.label !== 'Admin' && item.label !== 'Messages') {
              return null;
            }
            // Only show Admin if user has ADMIN role
            if (item.label === 'Admin' && user?.role !== 'ADMIN') {
              return null;
            }
            const IconComponent = item.icon;
            return (
              <button
                key={item.label}
                className={`nav-item ${activeNav === item.label ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav(item.label);
                  navigate(item.path);
                }}
              >
                <span className="nav-icon"><IconComponent size={20} /></span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {user ? (
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="profile" onClick={() => navigate('/profile')} style={{ marginTop: 0 }}>
              <div className="profile-avatar">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div className="profile-info">
                <strong>{user.firstName} {user.lastName}</strong>
                <span>View profile</span>
              </div>
              <span className="profile-arrow">→</span>
            </button>
            <button 
              className="nav-item" 
              onClick={handleLogout} 
              style={{ justifyContent: 'center', color: '#dc2626', background: '#fee2e2', fontWeight: 'bold' }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/login" className="nav-item" style={{ justifyContent: 'center', background: 'var(--cput-blue)', color: 'white' }}>Login</Link>
            <Link to="/signup" className="nav-item" style={{ justifyContent: 'center', background: '#f5f7f8' }}>Sign Up</Link>
          </div>
        )}
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes without MainLayout (Full Screen) */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* All other routes with MainLayout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/order-details/:id" element={<OrderDetails />} />
          <Route path="/help" element={<HelpFAQ />} />
          <Route path="/report-listing" element={<ReportListing />} />
          <Route path="/terms" element={<TermsPrivacy />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
