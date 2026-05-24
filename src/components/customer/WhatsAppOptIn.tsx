import { MessageCircle } from "lucide-react";

export function WhatsAppOptIn() {
  return (
    <form className="card stack">
      <div className="card-header">
        <h3>WhatsApp Updates</h3>
        <MessageCircle size={20} aria-hidden="true" />
      </div>
      <label className="form-row">
        Telefonnummer
        <input className="input" name="phoneNumber" placeholder="+49 170 1234567" />
      </label>
      <label className="toolbar">
        <input name="whatsappOptIn" type="checkbox" />
        Bestellstatus und Abholerinnerung per WhatsApp erhalten
      </label>
      <button className="button primary" type="button">
        Speichern
      </button>
    </form>
  );
}
