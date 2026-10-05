import "../style/ContactLocation.css";

const ContactLocation = () => {
  // Replace these values when the final office address is available.
  const officeAddress = "Clock Tower, Dehradun, Uttarakhand, India";

  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    officeAddress
  )}&output=embed`;

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    officeAddress
  )}`;

  return (
    <section
      className="qyx-contact-location"
      aria-labelledby="qyx-contact-location-title"
    >
      <div className="qyx-contact-location__container">
        <div className="qyx-contact-location__content">
          <span className="qyx-contact-location__eyebrow">
            FIND US IN DEHRADUN
          </span>

          <h2 id="qyx-contact-location-title">
            A place to start
            <span>the conversation.</span>
          </h2>

          <p className="qyx-contact-location__description">
            Have a question about QYX or want to connect with our team?
            Reach out before planning your visit so we can guide you.
          </p>

          <div className="qyx-contact-location__address">
            <span className="qyx-contact-location__label">
                LOCATION
            </span>

            <h3>Clock Tower area</h3>

            <address>
              Dehradun, Uttarakhand
              <br />
              India
            </address>

            <p className="qyx-contact-location__placeholder">
              Temporary location — our final office address and visiting
              details will be updated here.
            </p>
          </div>

          <div className="qyx-contact-location__actions">
            <a
              className="qyx-contact-location__primary"
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
              <span aria-hidden="true">↗</span>
            </a>

            <a
              className="qyx-contact-location__secondary"
              href="tel:+917453898747"
            >
              Call our team
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="qyx-contact-location__map-wrapper">
          <iframe
            className="qyx-contact-location__map"
            src={mapEmbedUrl}
            title="Google Map showing the sample Clock Tower location in Dehradun"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />

          <div className="qyx-contact-location__map-caption">
            <div>
              <strong>Dehradun · Location</strong>
              <p>Final office address to be confirmed</p>
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open sample Dehradun location in Google Maps"
            >
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactLocation;