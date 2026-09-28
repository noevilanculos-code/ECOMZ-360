import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EcoMap } from '../components/EcoMap';
import { useApp } from '../context/AppContext';

export const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const { occurrences, selectedProvince, setSelectedProvince } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <EcoMap
        occurrences={occurrences}
        selectedProvince={selectedProvince}
        setSelectedProvince={setSelectedProvince}
        onSelectOccurrence={(occ) => navigate(`/ocorrencias/${occ.id}`)}
        onNewReport={() => navigate('/ocorrencias?novo=true')}
      />
    </div>
  );
};
