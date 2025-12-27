// donationService.js
import { supabase } from '../lib/supabase';

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

  if (error) {
    console.error('Error loading transfer data:', error);
    return [];
  }

  return data.donation_transfer_data;
}
