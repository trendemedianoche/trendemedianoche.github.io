// donationService.js
import { supabase } from '../lib/supabase';

/* ===============================
   LECTURA (FRONT / PUBLIC)
================================ */
export async function getTransferData() {
  const { data, error } = await supabase
    .from('donation_methods')
    .select(`
      id,
      type,
      donation_transfer_data (
        id,
        field_key,
        field_value,
        position,
        visible
      )
    `)
    .eq('type', 'transfer')
    .eq('active', true)
    .order('position', { foreignTable: 'donation_transfer_data' })
    .single();

  if (error || !data) {
    console.error('Error loading transfer data:', error);
    return [];
  }

  return data.donation_transfer_data.filter(f => f.visible);
}

/* ===============================
   ADMIN
================================ */

// Obtener TODOS (incluye ocultos)
export async function getTransferDataAdmin() {
  const { data, error } = await supabase
    .from('donation_methods')
    .select(`
      id,
      donation_transfer_data (
        id,
        field_key,
        field_value,
        position,
        visible
      )
    `)
    .eq('type', 'transfer')
    .eq('active', true)
    .limit(1);

  if (error || !data?.length) {
    console.error('Admin load error:', error);
    return { methodId: null, fields: [] };
  }

  return {
    methodId: data[0].id,
    fields: data[0].donation_transfer_data.sort(
      (a, b) => a.position - b.position
    )
  };
}

// Crear campo
export async function createTransferField(methodId, field) {
  return supabase
    .from('donation_transfer_data')
    .insert({
      donation_method_id: methodId,
      position: field.position,
      field_key: field.field_key,
      field_value: field.field_value,
      visible: true
    });
}

// Actualizar campo
export async function updateTransferField(id, updates) {
  return supabase
    .from('donation_transfer_data')
    .update(updates)
    .eq('id', id);
}

// Eliminar campo
export async function deleteTransferField(id) {
  return supabase
    .from('donation_transfer_data')
    .delete()
    .eq('id', id);
}

// Reordenar
export async function reorderTransferFields(fields) {
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];

    await supabase
      .from('donation_transfer_data')
      .update({ position: i + 1 })
      .eq('id', field.id);
  }
}

