import futureFamily from "../assets/concern_privately.png";
import growingFamily from "../assets/verified_specialist.png";
import mensHealth from "../assets/video_call.png";
import privateCare from "../assets/relationship.png";
import "../style/YourPath.css";

const paths = [
  {
    title: "Share your concern privately a short, confidential intake so the specialist has context before you speak.",
    image: futureFamily,
    alt: "A man spending time with his family",
    href: "/consultation",
  },
  {
    title: "Get mathed with a verified specialist - credential checked male fertility experts, not a general helpline",
    image: growingFamily,
    alt: "A family enjoying time together",
    href: "/consultation",
  },
  {
    title: "Consult on video or chat, from your phone at a time that works for you.",
    image: mensHealth,
    alt: "A man outdoors",
    href: "/consultation",
  },
  {
    title: "Continue the rlationship, book follow-ups and keep a private consultation history in one place.",
    image: privateCare,
    alt: "A man considering a private consultation",
    href: "/consultation",
  },
];

const YourPath = () => {
  return (
    <section className="your-path" aria-labelledby="your-path-title">
      <div className="your-path-container">
        <div className="your-path-heading">
          <span>WHEREVER YOU ARE IN YOUR JOURNEY</span>
          <h2 id="your-path-title">Talk to real specialist, privately on your terms.</h2>
          <p>QYX connect Indian men directly with verified male fertlity specialist for private video or chat consulttaion, so the hardest step, starting the conversation, no longer requires a clinic visit, a referal, or an explannation to anyone.</p>
        </div>

        <div className="your-path-grid">
          {paths.map((path) => (
            // <a
            //   className="your-path-card"
            //   href={path.href}
            //   key={path.title}
            // >
            <div className="your-path-card">
                <img src={path.image} alt={path.alt} loading="lazy" />

              <div className="your-path-card-content">
                <h3>{path.title}</h3>
                {/* <span className="your-path-arrow" aria-hidden="true">
                  →
                </span> */}
              </div>
            </div>
              
            // </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default YourPath;