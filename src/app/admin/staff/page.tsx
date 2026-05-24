export default function AdminStaffPage() {
  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Mitarbeiter</h1>
      </header>
      <form className="card stack">
        <label className="form-row">
          E-Mail
          <input className="input" placeholder="stand@example.local" />
        </label>
        <label className="form-row">
          Stand
          <select className="input" defaultValue="stand_mannheim_ost">
            <option value="stand_mannheim_ost">Sonnenhof Mannheim Ost</option>
          </select>
        </label>
        <button className="button primary" type="button">
          Mitarbeiter anlegen
        </button>
      </form>
    </>
  );
}
