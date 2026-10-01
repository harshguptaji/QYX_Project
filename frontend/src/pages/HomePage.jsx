
import AwarenessGap from '../components/AwarenessGap'
import CareOutcomes from '../components/CareOutcomes'
import FertilityAwareness from '../components/FertilityAwareness'
import Footer from '../components/Footer'
import FoundersSection from '../components/FoundersSection'
import HeroBanner from '../components/HeroBanner'
import HowQYXWorks from '../components/HowQYXWorks'
import Navbar from '../components/Navbar'
import PrivateCareFeature from '../components/PrivateCareFeature'
import PrivateConsultation from '../components/PrivateConsultation'
import QYXCarousel from '../components/QYXCarousel'
import SpermCountSection from '../components/SpermCountSection'
import YourPath from '../components/YourPath'


const HomePage = () => {
  return (
    <>
      <Navbar/>
      <HeroBanner/>
      <CareOutcomes/>
      <SpermCountSection/>
      <FertilityAwareness/>
      <PrivateConsultation/>
      <AwarenessGap/>
      <YourPath/>
      <HowQYXWorks/>
      <PrivateCareFeature/>
      <QYXCarousel/>
      <FoundersSection/>
      <Footer/>
    </>
  )
}

export default HomePage