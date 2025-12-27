import { useEffect, useState } from 'react';
import { getTransferData } from '../services/donationService';

export default function DonateCard() {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    getTransferData().then(setFields);
  }, []);

  const copyData = () => {
    const text = fields
      .map(f => `${f.field_key}: ${f.field_value}`)
      .join('\n');

    navigator.clipboard.writeText(text)
      .then(() => alert('Datos de transferencia copiados'));
  };

  const visibleFields = fields.filter(f => f.visible);

  if (!fields.length) return null;

  return (
    <div className="side-card donation-card">
      <h3>Apoya el proyecto</h3>

      <p className="donation-intro">
        Si quieres apoyar nuestro trabajo y futuras producciones,
        puedes hacerlo mediante transferencia bancaria:
      </p>

      <div className="donation-grid">
        {visibleFields.map(field => (
          <div key={field.id}>
            <span>{field.field_key}</span>
            <strong>{field.field_value}</strong>
          </div>
        ))}
      </div>

      <button className="copy-button" onClick={copyData}>
        📋 Copiar datos
      </button>
    </div>
  );
}
