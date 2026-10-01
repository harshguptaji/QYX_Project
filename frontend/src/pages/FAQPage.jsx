import Navbar from '../components/Navbar'
import FaqBanner from '../components/FaqBanner'
import FaqList from '../components/FaqList'
import FaqSupport from '../components/FaqSupport'
import Footer from '../components/Footer'
import "../style/FAQ.css"

const FAQPage = () => {
  return (
    <>
    <Navbar/>
    <main className='faq-page'>
        <FaqBanner/>
        <FaqList/>
        <FaqSupport/>
    </main>
    <Footer/>
    </>
  )
}

export default FAQPage