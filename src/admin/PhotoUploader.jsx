import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function PhotoUploader() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchImages();
  }, []);

  // Obtener lista de imágenes del bucket
  const fetchImages = async () => {
    const { data, error } = await supabase.storage
      .from('trendemedianoche_assets')
      .list('', { limit: 100, offset: 0 });

    if (!error) setImages(data);
  };

  // Subir nueva imagen
  const handleUpload = async () => {
    if (!file) return setMessage('Selecciona un archivo primero');

    const { data, error } = await supabase.storage
      .from('trendemedianoche_assets')
      .upload(file.name, file, { cacheControl: '3600', upsert: true });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Archivo subido con éxito');
      fetchImages();
    }
  };

  // Borrar imagen
  const handleDelete = async (fileName) => {
    const { error } = await supabase.storage
      .from('trendemedianoche_assets')
      .remove([fileName]);

    if (!error) {
      setMessage(`Archivo ${fileName} eliminado`);
      fetchImages();
    }
  };

  // Obtener URL pública
  const getPublicUrl = (path) => {
    return supabase.storage.from('trendemedianoche_assets').getPublicUrl(path).publicUrl;
  };

  return (
    <div style={{ margin: '1rem 0' }}>
      <h2>Administrar Fotos</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Subir</button>
      {message && <p>{message}</p>}

      <h3>Imágenes cargadas:</h3>
      <ul>
        {images.map((img) => (
          <li key={img.name}>
            <img
              src={getPublicUrl(img.name)}
              alt={img.name}
              style={{ width: '100px', marginRight: '10px' }}
            />
            {img.name}
            <button onClick={() => handleDelete(img.name)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
