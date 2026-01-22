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
        active,
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

  return data.donation_transfer_data.filter(f => f.active);
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
        active,
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
      visible: true,
      active: true
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

/* ===============================
   REDES SOCIALES
================================ */

export async function getSocialNetworks() {
  const { data, error } = await supabase
    .from('social_networks')
    .select('*')
    .eq('active', true)
    .order('position');

  if (error) {
    console.error('Error loading social networks:', error);
    return [];
  }

  return data || [];
}

export async function getSocialNetworksAdmin() {
  const { data, error } = await supabase
    .from('social_networks')
    .select('*')
    .order('position');

  if (error) {
    console.error('Error loading social networks admin:', error);
    return [];
  }

  return data || [];
}

export async function updateSocialNetwork(id, updates) {
  return supabase
    .from('social_networks')
    .update(updates)
    .eq('id', id);
}

export async function toggleSocialNetworkActive(id, active) {
  return supabase
    .from('social_networks')
    .update({ active })
    .eq('id', id);
}

export async function reorderSocialNetworks(networks) {
  for (let i = 0; i < networks.length; i++) {
    await supabase
      .from('social_networks')
      .update({ position: i + 1 })
      .eq('id', networks[i].id);
  }
}
// Funciones helper para obtener datos específicos del footer
export async function getFooterContactData() {
  const { data, error } = await supabase
    .from('social_networks')
    .select('*')
    .eq('active', true)
    .in('type', ['email', 'phone'])
    .order('position');

  if (error) {
    console.error('Error loading footer contact data:', error);
    return { email: null, phone: null };
  }

  const result = { email: null, phone: null };
  
  data?.forEach(item => {
    if (item.type === 'email') result.email = item.url;
    if (item.type === 'phone') result.phone = item.url;
  });

  return result;
}

export async function getFooterSocialNetworks() {
  const { data, error } = await supabase
    .from('social_networks')
    .select('*')
    .eq('active', true)
    .eq('type', 'social')
    .order('position');

  if (error) {
    console.error('Error loading footer social networks:', error);
    return [];
  }

  return data || [];
}