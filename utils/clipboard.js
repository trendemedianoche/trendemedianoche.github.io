export function copyTransferData(data) {
  const text = `
${data.accountType}
${data.bank}
${data.accountNumber}
${data.name}
Rut: ${data.rut}
${data.email}
`.trim();

  if (!navigator.clipboard) {
    alert('El navegador no soporta copiar al portapapeles');
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => {
      alert('Datos de transferencia copiados');
    })
    .catch((err) => {
      console.error('Clipboard error:', err);
      alert('Error al copiar los datos');
    });
}
