import "../style/ContactLocation.css";

const ContactLocation = () => {
  const officeAddress =
    "Officespaze.com, IT Park, Plot Number B2, Sahastradhara Road, Doon IT Park, Govind Vihar, Dehradun, Uttarakhand - 248013";

  const latitude = 30.3592295;
  const longitude = 78.088687;

  const mapEmbedUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <section
      className="qyx-contact-location"
      aria-labelledby="qyx-contact-location-title">
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
            Have a question about QYX or want to connect with our team? Contact
            us before planning your visit so we can help you coordinate.
          </p>

          <div className="qyx-contact-location__address">
            <span className="qyx-contact-location__label">OFFICE ADDRESS</span>

            <h3>QYX Office, Dehradun</h3>

            <address>
              B-2, IT Park
              <br />
              Sahastradhara Road
              <br />
              Dehradun, Uttarakhand – 248001
              <br />
              India
            </address>
          </div>

          <div className="qyx-contact-location__actions">
            <a
              className="qyx-contact-location__primary"
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer">
              Get directions
              <span aria-hidden="true">↗</span>
            </a>

            <a
              className="qyx-contact-location__secondary"
              href="tel:+918077015881">
              Call our team
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="qyx-contact-location__map-wrapper">
          <iframe
            src={mapEmbedUrl}
            title="QYX Office Location"
            width="100%"
            height="400"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />

          <div className="qyx-contact-location__map-caption">
            <div>
              <strong>QYX Office · Dehradun</strong>
              <p>B-2, IT Park, Sahastradhara Road</p>
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get directions to the QYX office in Google Maps">
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactLocation;
