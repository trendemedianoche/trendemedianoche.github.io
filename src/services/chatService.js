import { supabase } from '../lib/supabase';

export async function getChatMessages() {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function sendChatMessage({ name, email, message }) {
  const { error } = await supabase
    .from('chat_messages')
    .insert([
      { name, email, message, read: false }
    ]);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function markChatAsRead(id) {
  const { error } = await supabase
    .from('chat_messages')
    .update({ read: true })
    .eq('id', id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteChatMessage(id) {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(error);
    throw error;
  }
}
