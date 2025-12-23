import donateData from '../data/donate.json';
import { copyTransferData } from '/utils/clipboard.js';

export default function DonateCard() {
  return (
    <div className="side-card donation-card">
      <h3>Apoya el proyecto</h3>

      <p className="donation-intro">
        Si quieres apoyar nuestro trabajo y futuras producciones,
        puedes hacerlo mediante transferencia bancaria:
      </p>

      <div className="donation-grid">
        <div>
          <span>Banco</span>
          <strong>{donateData.bank}</strong>
        </div>
        <div>
          <span>Cuenta</span>
          <strong>{donateData.accountNumber}</strong>
        </div>
        <div>
          <span>Nombre</span>
          <strong>{donateData.name}</strong>
        </div>
        <div>
          <span>Asunto</span>
          <strong>Aporte</strong>
        </div>
      </div>

      <button
        className="copy-button"
        onClick={() => copyTransferData(donateData)}
      >
        📋 Copiar datos
      </button>
    </div>
  );
}
