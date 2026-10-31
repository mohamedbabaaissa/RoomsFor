import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { PublicLayout, DashboardLayout } from './components/Layouts';
import RequireRole from './components/RequireRole';

import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import BusinessRegister from './pages/BusinessRegister';
import NotFound from './pages/NotFound';

import AdminOverview from './pages/admin/Overview';
import AdminBusinesses from './pages/admin/Businesses';
import AdminUsers from './pages/admin/Users';
import AdminListings from './pages/admin/Listings';
import AdminBookings from './pages/admin/Bookings';
import AdminMessages from './pages/admin/Messages';
import AdminCities from './pages/admin/Cities';
import AdminCurrency from './pages/admin/Currency';

import BizOverview from './pages/business/Overview';
import BizListings from './pages/business/Listings';
import BizListingEdit from './pages/business/ListingEdit';
import BizBookings from './pages/business/Bookings';
import BizProfile from './pages/business/Profile';

import MyBookings from './pages/account/MyBookings';
import Favorites from './pages/account/Favorites';
import Profile from './pages/account/Profile';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Login admin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/business/register" element={<BusinessRegister />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin" element={<RequireRole role="admin"><DashboardLayout kind="admin" /></RequireRole>}>
          <Route index element={<AdminOverview />} />
          <Route path="businesses" element={<AdminBusinesses />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="cities" element={<AdminCities />} />
          <Route path="currency" element={<AdminCurrency />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>

        <Route path="/business" element={<RequireRole role="business"><DashboardLayout kind="business" /></RequireRole>}>
          <Route index element={<BizOverview />} />
          <Route path="listings" element={<BizListings />} />
          <Route path="listings/new" element={<BizListingEdit />} />
          <Route path="listings/:id/edit" element={<BizListingEdit />} />
          <Route path="bookings" element={<BizBookings />} />
          <Route path="profile" element={<BizProfile />} />
        </Route>

        <Route path="/account" element={<RequireRole role="user"><DashboardLayout kind="user" /></RequireRole>}>
          <Route index element={<MyBookings />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}
