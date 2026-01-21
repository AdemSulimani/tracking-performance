import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
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
import { Sales } from './Components/Code/Dashboards/Sales'
import { Telemarketing } from './Components/Code/Dashboards/Telemarketing'
import { RealEstate } from './Components/Code/Dashboards/RealEstate'
import { Agency } from './Components/Code/Dashboards/Agency'

function App() {
  const [isBannerHidden, setIsBannerHidden] = useState(false);

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
      <Route path="/authentication" element={<Authentication />} />
      <Route path="/forgot-password" element={<Forgotpass />} />
      <Route path="/sales" element={<Sales />} />
      <Route path="/telemarketing" element={<Telemarketing />} />
      <Route path="/real-estate" element={<RealEstate />} />
      <Route path="/agency" element={<Agency />} />
    </Routes>
  )
}

export default App
