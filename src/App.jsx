import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Enquiries from './pages/Enquiries'
import Customers from './pages/Customers'
import Sections from './pages/Sections'
import SectionEditor from './pages/SectionEditor'
import Navigation from './pages/Navigation'
import Media from './pages/Media'
import Settings from './pages/Settings'
import Legal from './pages/Legal'
import Account from './pages/Account'
import {
  AdminsPage,
  CareDurationsPage,
  EnquiryStatusesPage,
  FaqCategoriesPage,
  FaqsPage,
  ServiceCategoriesPage,
  ServicesPage,
  TeamPage,
  TestimonialsPage,
} from './pages/resources'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="customers" element={<Customers />} />
          <Route path="enquiry-statuses" element={<EnquiryStatusesPage />} />
          <Route path="sections" element={<Sections />} />
          <Route path="sections/:id" element={<SectionEditor />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="service-categories" element={<ServiceCategoriesPage />} />
          <Route path="care-durations" element={<CareDurationsPage />} />
          <Route path="faqs" element={<FaqsPage />} />
          <Route path="faq-categories" element={<FaqCategoriesPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="navigation" element={<Navigation />} />
          <Route path="legal" element={<Legal />} />
          <Route path="media" element={<Media />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admins" element={<AdminsPage />} />
          <Route path="account" element={<Account />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
