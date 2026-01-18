import { useState } from 'react'
import './App.css'
import { Banner } from './Components/Code/Landing Page/Banner'
import { Header } from './Components/Code/Landing Page/Header'
import { Home } from './Components/Code/Landing Page/Home'
import { Explore } from './Components/Code/Landing Page/Explore'

function App() {
  const [isBannerHidden, setIsBannerHidden] = useState(false);

  return (
    <>
      <Banner onBannerHidden={setIsBannerHidden} />
      <Header isBannerHidden={isBannerHidden} />
      <Home />
      <Explore />
    </>
  )
}

export default App
