import { useState } from 'react'
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

function App() {
  const [isBannerHidden, setIsBannerHidden] = useState(false);

  return (
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
  )
}

export default App
