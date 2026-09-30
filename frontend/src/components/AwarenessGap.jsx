import awarenessGap from "../assets/why_qyx.png"
import "../style/AwarenessGap.css"
const AwarenessGap = () => {
  return (
    <section className='awareness-gap-section'>
        <h2>It's rarely the numbers that stop men. It's the waiting room</h2>
        <div className="awareness-gap-flex">
            <div className="awareness-gap-flex-1">
                <div className="awareness-gap-flex-1-item">What if someone at the clinic recognizes me?</div>
                <div className="awareness-gap-flex-1-item">That is supposed to be my wife's problem to solve not mine</div>
                <div className="awareness-gap-flex-1-item">If I ask for a consultation, am I admitting something is wrong with me?</div>
            </div>
            <div className="awareness-gap-flex-2">
                <img className="awareness-gap-img" src={awarenessGap} alt="awareness gap" />
            </div>
        </div>
    </section>
  )
}

export default AwarenessGap