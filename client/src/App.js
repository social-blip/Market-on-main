import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return null;
};

// Layouts
import PublicLayout from './components/PublicLayout';
import VendorLayout from './components/VendorLayout';
import AdminLayout from './components/AdminLayout';

// Public Pages
import Vendors from './pages/public/Vendors';
import VendorDetail from './pages/public/VendorDetail';
import Map from './pages/public/Map';
import Apply from './pages/public/Apply';
import BecomeVendor from './pages/public/BecomeVendor';
import FindUs from './pages/public/FindUs';
import GetInvolved from './pages/public/GetInvolved';
import Contact from './pages/public/Contact';
import TestHome from './pages/public/TestHome';
import TestHome2 from './pages/public/TestHome2';
import TestHome3 from './pages/public/TestHome3';
import TestHome4 from './pages/public/TestHome4';
import BlogPost from './pages/public/BlogPost';
import Blog from './pages/public/Blog';
import ApplyThankYou from './pages/public/ApplyThankYou';
import Sponsor from './pages/public/Sponsor';
import SponsorFlyer from './pages/public/SponsorFlyer';

// Auth Pages
import VendorLogin from './pages/vendor/Login';
import AdminLogin from './pages/admin/Login';
import SetupPassword from './pages/vendor/SetupPassword';

// Vendor Pages
import VendorDashboard from './pages/vendor/Dashboard';
import VendorSchedule from './pages/vendor/Schedule';
import VendorPayments from './pages/vendor/Payments';
import VendorProfile from './pages/vendor/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminVendors from './pages/admin/Vendors';
import AdminVendorDetail from './pages/admin/VendorDetail';
import AdminDates from './pages/admin/Dates';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminPayments from './pages/admin/Payments';
import AdminMaps from './pages/admin/Maps';
import MapBuilder from './pages/admin/MapBuilder';
import AdminMusicApplications from './pages/admin/MusicApplications';
import MusicScheduleBuilder from './pages/admin/MusicScheduleBuilder';
import AdminBlog from './pages/admin/Blog';
import AdminBlogEditor from './pages/admin/BlogEditor';

// Protected Route Components
const VendorRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-4"><span className="spinner"></span></div>;
  }

  if (!user || user.role !== 'vendor') {
    return <Navigate to="/vendor/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-4"><span className="spinner"></span></div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Homepage - has its own header/footer */}
      <Route path="/" element={<TestHome4 />} />

      {/* Public Routes with shared layout */}
      <Route element={<PublicLayout />}>
        <Route path="vendors" element={<Vendors />} />
        <Route path="vendors/:id" element={<VendorDetail />} />
        <Route path="map" element={<Map />} />
        <Route path="apply" element={<Apply />} />
        <Route path="apply/thank-you" element={<ApplyThankYou />} />
        <Route path="become-vendor" element={<BecomeVendor />} />
        <Route path="find-us" element={<FindUs />} />
        <Route path="get-involved" element={<GetInvolved />} />
        <Route path="contact" element={<Contact />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="sponsor" element={<Sponsor />} />
      </Route>

      {/* Print Pages */}
      <Route path="/sponsor/flyer" element={<SponsorFlyer />} />

      {/* Test Pages */}
      <Route path="/test-home" element={<TestHome />} />
      <Route path="/test-home-2" element={<TestHome2 />} />
      <Route path="/test-home-3" element={<TestHome3 />} />

      {/* Auth Routes */}
      <Route path="/vendor/login" element={<VendorLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/setup-password" element={<SetupPassword />} />

      {/* Vendor Routes */}
      <Route path="/vendor" element={
        <VendorRoute>
          <VendorLayout />
        </VendorRoute>
      }>
        <Route index element={<Navigate to="/vendor/dashboard" replace />} />
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="schedule" element={<VendorSchedule />} />
        <Route path="payments" element={<VendorPayments />} />
        <Route path="profile" element={<VendorProfile />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="vendors" element={<AdminVendors />} />
        <Route path="vendors/:id" element={<AdminVendorDetail />} />
        <Route path="dates" element={<AdminDates />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="maps" element={<AdminMaps />} />
        <Route path="maps/builder" element={<MapBuilder />} />
        <Route path="maps/builder/:dateId" element={<MapBuilder />} />
        <Route path="music-applications" element={<AdminMusicApplications />} />
        <Route path="music-schedule" element={<MusicScheduleBuilder />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="blog/new" element={<AdminBlogEditor />} />
        <Route path="blog/:id/edit" element={<AdminBlogEditor />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App;
