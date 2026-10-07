import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DoctorsUpperSection from '../components/DoctorsUpperSection'
import DoctorsMiddleSection from '../components/DoctorsMiddleSections'
import DoctorsLowerSection from '../components/DoctorsLowerSections'

const DoctorPage = () => {
  return (
    <>
        <Navbar/>
        <DoctorsUpperSection/>
        <DoctorsMiddleSection/>
        <DoctorsLowerSection/>
        <Footer/>
    </>
  )
}

export default DoctorPage