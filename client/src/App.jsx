import React from 'react';
import { Helmet } from 'react-helmet';
import ReportGenerator from '@/components/ReportGenerator';
import { Toaster } from '@/components/ui/toaster';
import NeuralBackground from '@/components/NeuralBackground';

function App() {
  return (
    <>
      <Helmet>
        <title>BrainStudio Metrics Generator</title>
        <meta name="description" content="Herramienta profesional de reportes de Meta Business Suite y Pauta Digital con análisis de IA" />
      </Helmet>
      <div className="flex flex-col min-h-screen relative">
        <NeuralBackground />
        <div className="relative z-10 flex-grow">
          <ReportGenerator />
        </div>
        <footer className="relative z-20 w-full p-8 text-center bg-transparent mt-12">
          <p className="text-gray-400 text-xs sm:text-sm mb-4">
            Herramienta estratégica de Brain Studio diseñada para optimizar el análisis y la toma de decisiones internas. Uso exclusivo del equipo Brain Studio.
          </p>
          <img 
            src="https://horizons-cdn.hostinger.com/9299339a-dcc9-4392-b1d7-37a562c8416d/844af8c3a4d68ae75c5e37b53f5278a6.png" 
            alt="Brain Studio Logo" 
            className="h-10 sm:h-12 mx-auto opacity-70 hover:opacity-100 transition-opacity duration-300"
          />
        </footer>
        <Toaster />
      </div>
    </>
  );
}

export default App;