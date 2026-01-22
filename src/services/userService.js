import { supabase } from '../lib/supabase';

export async function getUsers() {
  console.log('🔍 Cargando usuarios desde auth.users...');
  
  // Usar Supabase Admin API para listar usuarios
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('❌ Error loading users:', error);
    throw error;
  }
  
  // Transformar la respuesta para que sea compatible con el formato esperado
  const users = data.users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email?.split('@')[0],
    role: user.user_metadata?.role || 'editor',
    active: !user.banned_until,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at
  }));
  
  console.log('✅ Usuarios cargados:', users);
  return users;
}

export async function updateUserRole(id, role) {
  console.log('🔄 Actualizando rol del usuario:', id, role);
  
  const { error } = await supabase.auth.admin.updateUserById(id, {
    user_metadata: { role }
  });

  if (error) {
    console.error('❌ Error updating role:', error);
    throw error;
  }
  
  console.log('✅ Rol actualizado');
}

export async function toggleUserActive(id, active) {
  console.log('🔄 Cambiando estado del usuario:', id, active);
  
  // Banear/desbanear usuario
  const { error } = await supabase.auth.admin.updateUserById(id, {
    ban_duration: active ? 'none' : '876000h' // 100 años si se desactiva
  });

  if (error) {
    console.error('❌ Error toggling active:', error);
    throw error;
  }
  
  console.log('✅ Estado actualizado');
}
