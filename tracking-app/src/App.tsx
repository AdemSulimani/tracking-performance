import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import { Banner } from './Components/Code/Landing Page/Banner'
import { Header } from './Components/Code/Landing Page/Header'
import { Home } from './Components/Code/Landing Page/Home'
import { Explore } from './Components/Code/Landing Page/Explore'
import { Performance } from './Components/Code/Landing Page/Performance'
import { OurProcess } from './Components/Code/Landing Page/OurProcess'
import { Resources } from './Components/Code/Landing Page/Resources'
import { Intergrations } from './Components/Code/Landing Page/Intergrations'
import { Ready } from './Components/Code/Landing Page/Ready'
import { Footer } from './Components/Code/Landing Page/Footer'
import { Login } from './Components/Code/Login-Register/Login'
import { Register } from './Components/Code/Login-Register/Register'
import { Authentication } from './Components/Code/Login-Register/Authentication'
import { Forgotpass } from './Components/Code/Login-Register/Forgotpass'
import { ResetPassword } from './Components/Code/Login-Register/ResetPassword'
import { SelectCompanyType } from './Components/Code/Login-Register/SelectCompanyType'
import { AuthSuccess } from './Components/Code/Login-Register/AuthSuccess'
import { Sales } from './Components/Code/Dashboards/Sales'
import { Telemarketing } from './Components/Code/Dashboards/Telemarketing'
import { RealEstate } from './Components/Code/Dashboards/RealEstate'
import { Agency } from './Components/Code/Dashboards/Agency'
import { ProtectedRoute } from './Components/ProtectedRoute'

function App() {
  const [isBannerHidden, setIsBannerHidden] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Kontrollo nëse ka token ose pendingVerificationEmail në localStorage
  useEffect(() => {
    // Kontrollo nëse ka token → user është i autentifikuar
    const token = localStorage.getItem('token');
    
    // Kontrollo nëse ka pendingVerificationEmail në localStorage
    const pendingEmail = localStorage.getItem('pendingVerificationEmail');
    
    // Nëse ka pendingVerificationEmail, duhet të shkojë në authentication (edhe nëse ka token të vjetër)
    if (pendingEmail) {
      // Pending verification email found
      
      // Nëse jemi në /authentication, mos bëj asgjë
      if (location.pathname === '/authentication') {
        return;
      }
      
      // Nëse nuk jemi në /authentication, ridrejto atje
      if (location.pathname !== '/login' && 
          location.pathname !== '/register' &&
          location.pathname !== '/forgot-password' &&
          location.pathname !== '/') {
        navigate('/authentication', { replace: true });
      }
    } else if (token) {
      // Nëse ka token dhe NUK ka pendingVerificationEmail, user është i autentifikuar plotësisht
      // Fully authenticated
      
      // Nëse jemi në /authentication dhe kemi token (por nuk ka pendingEmail), ridrejto në dashboard
      if (location.pathname === '/authentication') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            const dashboardMap: Record<string, string> = {
              'sales': '/sales',
              'real-estate': '/real-estate',
              'telemarketing': '/telemarketing',
              'agency': '/agency'
            };
            const dashboardPath = dashboardMap[user.companyType] || '/';
            navigate(dashboardPath, { replace: true });
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
      }
    } else {
      // Nëse nuk ka as token as pendingEmail, reset state
      // Reset state (no token or pending email)
    }
  }, [location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={
        <>
          <Banner onBannerHidden={setIsBannerHidden} />
          <Header isBannerHidden={isBannerHidden} />
          <Home />
          <Explore />
          <Performance />
          <OurProcess />
          <Resources />
          <Intergrations />
          <Ready />
          <Footer />
        </>
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth-success" element={<AuthSuccess />} />
      <Route path="/authentication" element={<Authentication />} />
      <Route path="/forgot-password" element={<Forgotpass />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route 
        path="/select-company-type" 
        element={
          <ProtectedRoute>
            <SelectCompanyType />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/sales" 
        element={
          <ProtectedRoute requiredCompanyType="sales">
            <Sales />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/telemarketing" 
        element={
          <ProtectedRoute requiredCompanyType="telemarketing">
            <Telemarketing />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/real-estate" 
        element={
          <ProtectedRoute requiredCompanyType="real-estate">
            <RealEstate />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/agency" 
        element={
          <ProtectedRoute requiredCompanyType="agency">
            <Agency />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default App
