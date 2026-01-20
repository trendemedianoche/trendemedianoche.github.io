import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSectionDividers } from '../services/sectionImagesService';
import { getSectionDescriptions } from '../services/sectionDescriptionsService';

const SiteContext = createContext();

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite debe ser usado dentro de SiteProvider');
  }
  return context;
};

export const SiteProvider = ({ children }) => {
  const [dividers, setDividers] = useState([]);
  const [descriptions, setDescriptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSiteContent = async () => {
    try {
      setLoading(true);
      const [dividersData, descriptionsData] = await Promise.all([
        getSectionDividers(),
        getSectionDescriptions(),
      ]);

      setDividers(dividersData);

      // Transformar descripciones a objeto por clave
      const descMap = {};
      descriptionsData.forEach(item => {
        descMap[item.section_key] = item.description;
      });
      setDescriptions(descMap);
      setError(null);
    } catch (err) {
      console.error('Error loading site content:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSiteContent();
  }, []);

  const value = {
    dividers,
    descriptions,
    loading,
    error,
    refresh: loadSiteContent,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};
