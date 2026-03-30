import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import ReportPreview from '@/components/ReportPreview';
import { Sparkles } from 'lucide-react';

function ReportGenerator() {
  const [config, setConfig] = useState({
    logo: null,
    title: 'Reporte de Desempeño Digital',
    year: new Date().getFullYear().toString(),
    primaryColor: '#000000',
    secondaryColor: '#20122f',
    tertiaryColor: '#a234fd'
  });
  
  // No longer a single csvData state, passed down handlers instead or managed inside ConfigPanel?
  // We'll let ConfigPanel manage files and pass up processedData directly.
  const [processedData, setProcessedData] = useState(null);
  const [aiInterpretations, setAiInterpretations] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="container mx-auto px-4 py-12 max-w-[1400px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
        <div className="inline-flex items-center justify-center gap-3 mb-6 px-6 py-2 rounded-full bg-[#20122f]/50 border border-[#a234fd]/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-[#a234fd]" />
          <span className="text-sm font-medium text-[#d8b4fe] tracking-wide uppercase">Brainstudio Agencia Creativa</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-white">
          BrainStudio <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a234fd] to-purple-400">Metrics</span>
        </h1>
        
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed font-light">
          Herramienta integral para procesar datos de Redes Sociales y Pauta Digital, generando informes estratégicos impulsados por IA.
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-12 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-5 xl:col-span-4">
          <ConfigurationPanel 
            config={config} 
            setConfig={setConfig} 
            setProcessedData={setProcessedData}
            setAiInterpretations={setAiInterpretations}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="lg:col-span-7 xl:col-span-8">
          <ReportPreview 
            config={config} 
            processedData={processedData} 
            aiInterpretations={aiInterpretations} 
            isGenerating={isGenerating} 
          />
        </motion.div>
      </div>
    </div>
  );
}

export default ReportGenerator;