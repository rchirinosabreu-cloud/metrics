import React from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, Loader2, FileCheck, BarChart2, Sparkles, TrendingUp, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { generateHTMLReport } from '@/utils/reportGenerator';

function ReportPreview({
  config,
  processedData,
  aiInterpretations,
  isGenerating
}) {
  const { toast } = useToast();

  const handleExportPDF = () => {
    if (!processedData || !aiInterpretations) return;
    const htmlContent = generateHTMLReport(config, processedData, aiInterpretations);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 1000);
    toast({
      title: "Imprimir a PDF",
      description: "Selecciona 'Guardar como PDF' en el diálogo de impresión."
    });
  };

  const handleExportHTML = () => {
    if (!processedData || !aiInterpretations) return;
    const htmlContent = generateHTMLReport(config, processedData, aiInterpretations);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.title.replace(/\s+/g, '_')}_${config.year}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Reporte exportado",
      description: "El reporte HTML ha sido descargado exitosamente"
    });
  };

  if (!processedData) {
    return (
      <div className="bg-[#111] border border-gray-800 rounded-2xl shadow-2xl p-8 h-full min-h-[600px] flex flex-col items-center justify-center text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#20122f]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 relative z-10 border border-gray-800 group-hover:border-[#a234fd]/30 transition-colors">
          <BarChart2 className="w-10 h-10 text-gray-600 group-hover:text-[#a234fd] transition-colors" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3 z-10">Esperando Datos</h3>
        <p className="text-gray-400 max-w-sm z-10 leading-relaxed">Sube archivos de RRSS y/o Pauta en el panel de configuración para iniciar el análisis.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-gray-800 rounded-2xl shadow-2xl p-8 h-full min-h-[600px] flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#a234fd]/10 rounded-lg">
             <Eye className="w-5 h-5 text-[#a234fd]" />
          </div>
          <h2 className="text-xl font-semibold text-white">Vista Previa</h2>
        </div>
        <div className="flex gap-2">
            {processedData.hasRRSS && <span className="text-xs font-mono text-gray-400 bg-[#1a1a1a] px-3 py-1 rounded-full border border-gray-800 flex items-center gap-1"><Share2 className="w-3 h-3"/> RRSS</span>}
            {processedData.hasPauta && <span className="text-xs font-mono text-gray-400 bg-[#1a1a1a] px-3 py-1 rounded-full border border-gray-800 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Ads</span>}
        </div>
      </div>

      {isGenerating ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#a234fd] blur-xl opacity-20 animate-pulse rounded-full"></div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="relative w-20 h-20 bg-gradient-to-br from-[#a234fd] to-[#20122f] rounded-full flex items-center justify-center mb-8 shadow-lg p-1">
              <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center">
                 <Loader2 className="w-8 h-8 text-[#a234fd]" />
              </div>
            </motion.div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Analizando Datos</h3>
          <p className="text-gray-400 max-w-sm">Procesando métricas y generando estrategias...</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Dashboard Preview */}
          <div className="flex-1 bg-[#0a0a0a] rounded-xl border border-gray-800 p-6 overflow-y-auto mb-6 custom-scrollbar">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800/50">
              <div className="flex items-center gap-4">
                {config.logo ? <img src={config.logo} alt="Logo" className="h-12 w-auto object-contain" /> : <div className="h-12 w-12 bg-gray-800 rounded-lg animate-pulse" />}
                <div>
                  <h3 className="font-bold text-white text-lg">{config.title}</h3>
                  <p className="text-sm text-[#a234fd] font-medium">{config.year} Reporte Integral</p>
                </div>
              </div>
            </div>

            {/* RRSS PREVIEW */}
            {processedData.hasRRSS && (
                <div className="mb-8">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Share2 className="w-3 h-3"/> Orgánico</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#151515] p-4 rounded-xl border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase mb-1">Alcance Total</p>
                            <p className="text-2xl font-bold text-white">{processedData.rrss.globalMetrics.totalViews.toLocaleString()}</p>
                        </div>
                        <div className="bg-[#151515] p-4 rounded-xl border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase mb-1">Interacción</p>
                            <p className="text-2xl font-bold text-[#a234fd]">{processedData.rrss.globalMetrics.interactions.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* PAUTA PREVIEW */}
            {processedData.hasPauta && (
                <div className="mb-8">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><TrendingUp className="w-3 h-3"/> Pauta</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#151515] p-4 rounded-xl border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase mb-1">Inversión</p>
                            <p className="text-2xl font-bold text-white">${processedData.pauta.totalSpend.toLocaleString(undefined, {minimumFractionDigits:0})}</p>
                        </div>
                        <div className="bg-[#151515] p-4 rounded-xl border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase mb-1">Conversiones</p>
                            <p className="text-2xl font-bold text-green-400">{processedData.pauta.totalConversions.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {!aiInterpretations && (
               <div className="text-center py-10 border border-dashed border-gray-800 rounded-xl">
                  <p className="text-gray-500 text-sm">Insights de IA aún no generados</p>
               </div>
            )}

            {aiInterpretations && (
                <div className="space-y-4">
                    {aiInterpretations.rrss && (
                        <div className="bg-[#20122f]/30 border border-[#a234fd]/20 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-2"><Sparkles className="w-3 h-3 text-[#a234fd]"/><span className="text-xs font-bold text-[#a234fd]">INSIGHT RRSS</span></div>
                            <p className="text-gray-300 text-xs italic line-clamp-3">"{aiInterpretations.rrss.executiveSummary}"</p>
                        </div>
                    )}
                    {aiInterpretations.pauta && (
                        <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-2"><Sparkles className="w-3 h-3 text-blue-400"/><span className="text-xs font-bold text-blue-400">INSIGHT ADS</span></div>
                            <p className="text-gray-300 text-xs italic line-clamp-3">"{aiInterpretations.pauta.adsExecutiveSummary}"</p>
                        </div>
                    )}
                </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleExportHTML} disabled={!aiInterpretations} className="h-12 bg-white text-black hover:bg-gray-200 font-semibold">
              <FileCheck className="w-4 h-4 mr-2" />
              Descargar HTML
            </Button>
            <Button onClick={handleExportPDF} disabled={!aiInterpretations} variant="outline" className="h-12 border-gray-700 text-gray-300 hover:bg-[#1a1a1a] hover:text-white">
              <Download className="w-4 h-4 mr-2" />
              PDF / Imprimir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportPreview;