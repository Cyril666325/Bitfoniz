import Features from '@/components/home/features'
import Footer from '@/components/home/Footer'
import GetStarted from '@/components/home/get-started'
import Hero from '@/components/home/Hero'
import HowItWorks from '@/components/home/how-it-works'
import Introduction from '@/components/home/Introduction'
import Market from '@/components/home/market'
import Navbar from '@/components/home/Navbar'
import React from 'react'

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Introduction />
      <Market />
      <Features />
      <HowItWorks />
      <GetStarted />
      <Footer />
    </div>
  )
}

export default Home