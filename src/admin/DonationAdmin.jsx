import { useEffect, useState } from 'react';
import {
  getTransferDataAdmin,
  updateTransferField,
  deleteTransferField,
  reorderTransferFields
} from '../services/donationService';
import '../styles/DonationAdmin.css';


export default function DonationAdmin() {
  const [fields, setFields] = useState([]);
  const [methodId, setMethodId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getTransferDataAdmin();
    setFields(res.fields);
    setMethodId(res.methodId);
  };

  const toggleVisible = async (field) => {
    await updateTransferField(field.id, {
      visible: !field.visible
    });
    load();
  };

  const updateValue = async (id, value) => {
    await updateTransferField(id, { field_value: value });
  };

  const move = async (index, dir) => {
    const updated = [...fields];
    const target = index + dir;
    if (target < 0 || target >= updated.length) return;

    [updated[index], updated[target]] =
      [updated[target], updated[index]];

    setFields(updated);
    await reorderTransferFields(updated);
  };

  return (
    <div className="admin-module">
      <h2>Datos de Donación</h2>

      {fields.map((f, i) => (
        <div key={f.id} className="donation-admin-row">
          <input
            value={f.field_value}
            onChange={e => updateValue(f.id, e.target.value)}
          />

          <span>{f.field_key}</span>

          <button onClick={() => toggleVisible(f)}>
            {f.visible ? '👁' : '🚫'}
          </button>

          <button onClick={() => move(i, -1)}>⬆</button>
          <button onClick={() => move(i, 1)}>⬇</button>

          <button onClick={() => deleteTransferField(f.id)}>
            🗑
          </button>
        </div>
      ))}
    </div>
  );
}
