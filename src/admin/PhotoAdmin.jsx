import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/PhotoAdmin.css'; // Importa el CSS

export default function PhotoAdmin() {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');

  const folder = ''; // Carpeta opcional dentro del bucket

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase.storage
      .from('trendemedianoche_assets')
      .list(folder, { limit: 100, offset: 0 });

    if (error) {
      console.error('Error al listar imágenes:', error.message);
      setMessage('No se pudieron cargar las imágenes.');
    } else {
      setImages(data || []);
      if ((data || []).length === 0) setMessage('No hay imágenes cargadas.');
      else setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Selecciona un archivo primero.');
      return;
    }

    const path = folder ? `${folder}/${file.name}` : file.name;

    const { error } = await supabase.storage
      .from('trendemedianoche_assets')
      .upload(path, file, { upsert: true });

    if (error) setMessage(`Error al subir: ${error.message}`);
    else {
      setMessage(`Archivo subido: ${file.name}`);
      setFile(null);
      fetchImages();
    }
  };

  const handleDelete = async (fileName) => {
    const path = folder ? `${folder}/${fileName}` : fileName;

    const { error } = await supabase.storage
      .from('trendemedianoche_assets')
      .remove([path]);

    if (error) setMessage(`Error al eliminar: ${error.message}`);
    else {
      setMessage(`Archivo eliminado: ${fileName}`);
      fetchImages();
    }
  };

  const getPublicUrl = (path) => {
    const fullPath = folder ? `${folder}/${path}` : path;
    return supabase.storage.from('trendemedianoche_assets').getPublicUrl(fullPath).publicUrl;
  };

  // JSX dentro de la función
  return (
    <div className="photo-admin">
      <h2>Administrar Fotos</h2>

      <div className="upload-section">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload}>Subir</button>
      </div>

      {message && <p className="message">{message}</p>}

      {images.length > 0 && (
        <div className="images-grid">
          {images.map((img) => (
            <div key={img.name} className="image-card">
              <img src={getPublicUrl(img.name)} alt={img.name} />
              <p>{img.name}</p>
              <button onClick={() => handleDelete(img.name)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
