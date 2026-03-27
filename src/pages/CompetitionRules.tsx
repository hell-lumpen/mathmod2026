import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CompetitionRules: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-primary hover:underline mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Вернуться на главную
        </Link>
        
        <h1 className="text-4xl font-bold mb-12 leading-tight">Положение о проведении интеллектуального состязания «Весенняя школа ИТ и ИИ 2026»</h1>
        
      </div>
    </div>
  );
};

export default CompetitionRules;
