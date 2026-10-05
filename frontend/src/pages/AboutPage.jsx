
import "../style/AboutTeamPage.css";
import Navbar from '../components/Navbar';
import AboutHero from '../components/AboutHero';
import AboutStory from '../components/AboutStory';
import DeviceDevelopment from '../components/DeviceDevelopment';
import AboutTeam from '../components/AboutTeam';
import AboutPrinciples from '../components/AboutPrinciples';
import Footer from '../components/Footer';
const AboutPage = () => {
  return (
    <>
        <Navbar/>
        <main className="qyx-about-page">
            <AboutHero/>
            <AboutStory/>
            <DeviceDevelopment/>
            <AboutTeam/>
            <AboutPrinciples/>
        </main>
        <Footer/>
    </>
  )
}

export default AboutPage