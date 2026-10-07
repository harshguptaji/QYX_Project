import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HowItWorksHero from '../components/HowItWorksHero'
import HowItWorksJourney from '../components/HowItWorksJourney'
import FirstConsultation from '../components/FirstConsultation'
import BeyondFirstCall from '../components/BeyondFirstCall'
import LittleReassurance from '../components/LittleReassurance'
import HowItWorksHighlights from '../components/HowItWorksHighlights'

const HowItsWorkPage = () => {
  return (
    <>
        <Navbar/>
        <HowItWorksHero/>
        <HowItWorksHighlights/>
        <HowItWorksJourney/>
        <FirstConsultation/>
        <BeyondFirstCall/>
        <LittleReassurance/>
        <Footer/>
    </>
  )
}

export default HowItsWorkPage