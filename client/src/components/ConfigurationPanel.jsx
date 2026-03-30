import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, X, Sparkles, CheckCircle2, TrendingUp, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Papa from 'papaparse';
import { processCSVData } from '@/utils/csvProcessor';
import { generateAIInterpretations } from '@/utils/aiService';

function ConfigurationPanel({
  config,
  setConfig,
  // csvData is now an object { rrss: [], pauta: [] } or handled internally via state below before passing up?
  // To keep it simple, we'll accept separate props or a setter that handles the specific key.
  // Refactoring to local state for files then processing up might be cleaner, but let's stick to props
  setProcessedData,
  setAiInterpretations,
  isGenerating,
  setIsGenerating
}) {
  const { toast } = useToast();
  
  // Local state for file tracking
  const [rrssFiles, setRrssFiles] = useState([]);
  const [pautaFiles, setPautaFiles] = useState([]);
  
  const [dragActiveRRSS, setDragActiveRRSS] = useState(false);
  const [dragActivePauta, setDragActivePauta] = useState(false);

  const handleLogoUpload = e => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Archivo demasiado grande",
          description: "Por favor sube una imagen menor a 2MB",
          variant: "destructive"
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        setConfig({
          ...config,
          logo: e.target.result
        });
        toast({
          title: "Logo actualizado",
          description: "Logo de la empresa procesado correctamente"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    const setActive = type === 'rrss' ? setDragActiveRRSS : setDragActivePauta;
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setActive(true);
    } else if (e.type === "dragleave") {
      setActive(false);
    }
  };

  const parseFiles = (files, type) => {
    const csvFiles = Array.from(files).filter(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFiles.length === 0) {
      toast({
        title: "Archivo inválido",
        description: "Solo se permiten archivos CSV",
        variant: "destructive"
      });
      return;
    }

    let processedCount = 0;
    const newData = [];

    csvFiles.forEach(file => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: results => {
          newData.push(...results.data);
          processedCount++;
          if (processedCount === csvFiles.length) {
            if (type === 'rrss') {
              setRrssFiles(prev => [...prev, ...newData]);
              toast({ title: "Archivos RRSS cargados", description: `${csvFiles.length} archivo(s) añadidos.` });
            } else {
              setPautaFiles(prev => [...prev, ...newData]);
              toast({ title: "Archivos Pauta cargados", description: `${csvFiles.length} archivo(s) añadidos.` });
            }
          }
        },
        error: error => {
          console.error('CSV Error:', error);
          toast({
            title: "Error de lectura",
            description: `Falló al leer ${file.name}`,
            variant: "destructive"
          });
        }
      });
    });
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'rrss') setDragActiveRRSS(false);
    else setDragActivePauta(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      parseFiles(e.dataTransfer.files, type);
    }
  };

  const handleUpload = (e, type) => {
    if (e.target.files && e.target.files.length > 0) {
      parseFiles(e.target.files, type);
    }
  };

  const clearData = (type) => {
    if (type === 'rrss') setRrssFiles([]);
    else setPautaFiles([]);
    // Clear global processed data if both are empty? 
    // Usually we re-process on generate, so local state clear is enough until then.
  };

  const handleGenerateAI = async () => {
    if (rrssFiles.length === 0 && pautaFiles.length === 0) {
      toast({
        title: "Faltan datos",
        description: "Por favor sube archivos de RRSS o Pauta para continuar",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // 1. Process Raw Data
      const processed = processCSVData(rrssFiles, pautaFiles);
      setProcessedData(processed);

      // 2. Generate AI Insights
      const interpretations = await generateAIInterpretations(processed);
      setAiInterpretations(interpretations);
      
      toast({
        title: "Análisis Completo",
        description: "La IA ha generado insights estratégicos exitosamente"
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error en el Análisis",
        description: error.message || "Fallo al generar insights con IA",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-[#111] border border-gray-800 rounded-2xl shadow-2xl p-6 lg:p-8 space-y-8 h-full">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-white tracking-wide">Configuración</h2>
        <div className="flex gap-2">
           <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
           <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
           <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
      </div>

      <div className="space-y-6">
        {/* RRSS Upload */}
        <div className="space-y-3">
          <Label className="text-gray-400 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
            <Share2 className="w-3 h-3" /> Archivos RRSS (Orgánico)
          </Label>
          <div 
            onDragEnter={(e) => handleDrag(e, 'rrss')} 
            onDragLeave={(e) => handleDrag(e, 'rrss')} 
            onDragOver={(e) => handleDrag(e, 'rrss')} 
            onDrop={(e) => handleDrop(e, 'rrss')} 
            className={`relative group border border-dashed rounded-xl p-6 text-center transition-all duration-300 ${dragActiveRRSS ? 'border-[#a234fd] bg-[#a234fd]/5 scale-[0.99]' : 'border-gray-700 hover:border-[#a234fd]/50 hover:bg-[#1a1a1a]'}`}
          >
            <Input type="file" accept=".csv" multiple onChange={(e) => handleUpload(e, 'rrss')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="relative z-0 space-y-2">
              <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-colors ${dragActiveRRSS ? 'bg-[#a234fd]/20 text-[#a234fd]' : 'bg-[#20122f] text-gray-400 group-hover:text-[#a234fd]'}`}>
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-300 font-medium text-sm">Arrastra CSVs de Redes Sociales</p>
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {rrssFiles.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#1a1a1a] rounded-lg p-2 border border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-300">{rrssFiles.length.toLocaleString()} registros RRSS</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => clearData('rrss')} className="h-6 w-6 p-0 text-gray-500 hover:text-red-400">
                  <X className="w-3 h-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pauta Upload */}
        <div className="space-y-3">
          <Label className="text-gray-400 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
            <TrendingUp className="w-3 h-3" /> Archivos Pauta (Ads)
          </Label>
          <div 
            onDragEnter={(e) => handleDrag(e, 'pauta')} 
            onDragLeave={(e) => handleDrag(e, 'pauta')} 
            onDragOver={(e) => handleDrag(e, 'pauta')} 
            onDrop={(e) => handleDrop(e, 'pauta')} 
            className={`relative group border border-dashed rounded-xl p-6 text-center transition-all duration-300 ${dragActivePauta ? 'border-[#a234fd] bg-[#a234fd]/5 scale-[0.99]' : 'border-gray-700 hover:border-[#a234fd]/50 hover:bg-[#1a1a1a]'}`}
          >
            <Input type="file" accept=".csv" multiple onChange={(e) => handleUpload(e, 'pauta')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="relative z-0 space-y-2">
              <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-colors ${dragActivePauta ? 'bg-[#a234fd]/20 text-[#a234fd]' : 'bg-[#20122f] text-gray-400 group-hover:text-[#a234fd]'}`}>
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-300 font-medium text-sm">Arrastra CSVs de Meta Ads</p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {pautaFiles.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#1a1a1a] rounded-lg p-2 border border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-300">{pautaFiles.length.toLocaleString()} registros Pauta</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => clearData('pauta')} className="h-6 w-6 p-0 text-gray-500 hover:text-red-400">
                  <X className="w-3 h-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Brand Identity */}
      <div className="space-y-4 pt-4 border-t border-gray-800">
        <Label className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Identidad de la marca</Label>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-2">
             <div className="relative">
              <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <label htmlFor="logo" className="flex items-center justify-center w-full h-12 px-4 transition bg-[#1a1a1a] border border-gray-700 border-dashed rounded-lg appearance-none cursor-pointer hover:border-[#a234fd]/50 hover:bg-[#20122f]/30 focus:outline-none">
                <span className="flex items-center space-x-2">
                  <Image className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-400 text-sm">
                    {config.logo ? 'Cambiar Logo' : 'Subir Logo'}
                  </span>
                </span>
              </label>
            </div>
            {config.logo && (
              <div className="p-4 bg-white/5 rounded-lg flex justify-center border border-gray-800">
                <img src={config.logo} alt="Preview" className="h-12 object-contain" />
              </div>
            )}
          </div>
          
          <div className="col-span-2 space-y-2">
            <Label htmlFor="title" className="text-xs text-gray-500">Nombre del reporte</Label>
            <Input id="title" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} className="bg-[#1a1a1a] border-gray-700 text-white focus:border-[#a234fd] focus:ring-[#a234fd]/20" />
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="space-y-4 pt-4 border-t border-gray-800">
         <Label className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Identidad del reporte</Label>
         <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="primaryColor" className="text-[10px] text-gray-500 uppercase">Primario</Label>
              <div className="flex items-center gap-2 bg-[#1a1a1a] p-1.5 rounded-lg border border-gray-700">
                <Input id="primaryColor" type="color" value={config.primaryColor} onChange={e => setConfig({...config, primaryColor: e.target.value})} className="w-8 h-8 p-0 border-0 rounded bg-transparent cursor-pointer" />
              </div>
            </div>
             <div className="space-y-1">
              <Label htmlFor="secondaryColor" className="text-[10px] text-gray-500 uppercase">Secundario</Label>
              <div className="flex items-center gap-2 bg-[#1a1a1a] p-1.5 rounded-lg border border-gray-700">
                <Input id="secondaryColor" type="color" value={config.secondaryColor} onChange={e => setConfig({...config, secondaryColor: e.target.value})} className="w-8 h-8 p-0 border-0 rounded bg-transparent cursor-pointer" />
              </div>
            </div>
             <div className="space-y-1">
              <Label htmlFor="tertiaryColor" className="text-[10px] text-gray-500 uppercase">Acento</Label>
              <div className="flex items-center gap-2 bg-[#1a1a1a] p-1.5 rounded-lg border border-gray-700">
                <Input id="tertiaryColor" type="color" value={config.tertiaryColor} onChange={e => setConfig({...config, tertiaryColor: e.target.value})} className="w-8 h-8 p-0 border-0 rounded bg-transparent cursor-pointer" />
              </div>
            </div>
         </div>
      </div>

      {/* Action */}
      <div className="pt-4 mt-auto">
        <Button 
          onClick={handleGenerateAI} 
          disabled={isGenerating || (rrssFiles.length === 0 && pautaFiles.length === 0)} 
          className="w-full h-14 bg-gradient-to-r from-[#a234fd] to-purple-600 hover:from-[#9024e0] hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(162,52,253,0.3)] hover:shadow-[0_0_30px_rgba(162,52,253,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-none"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="w-5 h-5" />
              </motion.div>
              Generando Análisis...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generar Reporte Estratégico
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export default ConfigurationPanel;