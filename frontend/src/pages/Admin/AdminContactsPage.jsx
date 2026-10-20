import ContactStats from
  "../../components/AdminDashboard/ContactStats";

import AllContacts from
  "../../components/AdminDashboard/AllContacts";

import "./AdminContactsPage.css";

export default function AdminContactsPage() {
  return (
    <div className="admin-contacts-page">
      <header className="admin-contacts-page__heading">
        <p>CONTACT MANAGEMENT</p>
        <h1>Every conversation starts here.</h1>
        <span>
          Review enquiries and keep track of messages awaiting attention.
        </span>
      </header>

      <ContactStats />
      <AllContacts />
    </div>
  );
}