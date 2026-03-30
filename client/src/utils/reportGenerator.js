export function generateHTMLReport(config, processedData, aiInterpretations) {
  const { logo, title, year, primaryColor, secondaryColor, tertiaryColor } = config;
  
  const pColor = primaryColor || '#000000';
  const sColor = secondaryColor || '#20122f';
  const aColor = tertiaryColor || '#a234fd';
  
  const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  // --- DATA PREPARATION FOR CHARTS ---
  let fbChartDataStr = '';
  let igChartDataStr = '';
  let combinedOrganicDataStr = ''; // New: Combined FB+IG

  let adsReachDataStr = ''; // New: Ads Reach
  let adsImpressionsDataStr = ''; // New: Ads Impressions

  if (processedData) {
    
    // 1. Organic Data
    if (processedData.hasRRSS) {
        // Facebook Cumulative
        const fbRaw = quarters.map(q => processedData.rrss.quarterly.facebook[q].reach);
        let fbSum = 0;
        const fbCumulative = fbRaw.map(val => { fbSum += val; return fbSum; });
        fbChartDataStr = fbCumulative.join(', ');

        // Instagram Cumulative
        const igRaw = quarters.map(q => processedData.rrss.quarterly.instagram[q].reach);
        let igSum = 0;
        const igCumulative = igRaw.map(val => { igSum += val; return igSum; });
        igChartDataStr = igCumulative.join(', ');

        // Combined Organic (Total Views/Reach)
        let combinedSum = 0;
        const combinedCumulative = quarters.map((q, i) => {
            const val = fbRaw[i] + igRaw[i];
            combinedSum += val;
            return combinedSum;
        });
        combinedOrganicDataStr = combinedCumulative.join(', ');
    }

    // 2. Ads Data
    if (processedData.hasPauta) {
        // Ads Reach Cumulative
        const adsReachRaw = quarters.map(q => processedData.pauta.quarterly[q].reach);
        let adsReachSum = 0;
        const adsReachCumulative = adsReachRaw.map(val => { adsReachSum += val; return adsReachSum; });
        adsReachDataStr = adsReachCumulative.join(', ');

        // Ads Impressions Cumulative
        const adsImpRaw = quarters.map(q => processedData.pauta.quarterly[q].impressions);
        let adsImpSum = 0;
        const adsImpCumulative = adsImpRaw.map(val => { adsImpSum += val; return adsImpSum; });
        adsImpressionsDataStr = adsImpCumulative.join(', ');
    }
  }

  // --- SECTIONS GENERATION ---
  let rrssSection = '';
  let pautaSection = '';
  
  // 1. GENERATE RRSS SECTION HTML
  if (processedData.hasRRSS && aiInterpretations.rrss) {
    const rrss = processedData.rrss;
    const ai = aiInterpretations.rrss;

    rrssSection = `
    <!-- RRSS EXECUTIVE SUMMARY -->
    <div class="page-break"></div>
    <div class="max-w-6xl mx-auto p-12">
      <div class="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Análisis Orgánico (RRSS)</h2>
        <span class="text-[${aColor}] font-bold text-lg tracking-wider">SOCIAL MEDIA</span>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:border-[${aColor}]/30 transition-all">
          <div class="absolute right-0 top-0 w-12 h-12 bg-blue-50 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110"></div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Impresiones</p>
          <p class="text-2xl font-extrabold text-slate-900 mt-1 relative z-10">${rrss.globalMetrics.totalViews.toLocaleString()}</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:border-[${aColor}]/30 transition-all">
          <div class="absolute right-0 top-0 w-12 h-12 bg-purple-50 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110"></div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Interacciones</p>
          <p class="text-2xl font-extrabold text-[${aColor}] mt-1 relative z-10">${rrss.globalMetrics.interactions.toLocaleString()}</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:border-[${aColor}]/30 transition-all">
          <div class="absolute right-0 top-0 w-12 h-12 bg-green-50 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110"></div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Nuevos Seguidores</p>
          <p class="text-2xl font-extrabold text-slate-900 mt-1 relative z-10">+${rrss.globalMetrics.followers.toLocaleString()}</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:border-[${aColor}]/30 transition-all">
          <div class="absolute right-0 top-0 w-12 h-12 bg-orange-50 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110"></div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Visitas Perfil</p>
          <p class="text-2xl font-extrabold text-slate-900 mt-1 relative z-10">${rrss.globalMetrics.profileVisits.toLocaleString()}</p>
        </div>
      </div>

      <!-- Main Analysis Grid -->
      <div class="grid grid-cols-12 gap-6 mb-8 items-start">
        <div class="col-span-8 flex flex-col gap-6">
           <!-- Card 1 -->
           <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div class="absolute top-0 left-0 w-1 h-full bg-slate-900"></div>
              <h3 class="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <span class="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-900">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                 </span>
                 Logros y Avances
              </h3>
              <div class="prose prose-slate max-w-none prose-p:text-sm prose-li:text-sm prose-strong:text-slate-900 prose-ul:list-disc prose-ul:pl-4 text-slate-600 leading-relaxed">
                 ${ai.executiveSummary}
              </div>
           </div>

           <!-- Card 2 -->
           <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 class="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <span class="w-6 h-6 rounded bg-[${aColor}]/10 flex items-center justify-center text-[${aColor}]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                 </span>
                 Contenido Top
              </h3>
              <div class="prose prose-slate max-w-none prose-p:text-sm prose-li:text-sm prose-strong:text-[${aColor}] prose-ul:list-none prose-ul:space-y-2 text-slate-600 leading-relaxed">
                 ${ai.contentAnalysis}
              </div>
           </div>
           
           <!-- Card 3 -->
           <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 class="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                 <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Desglose por Plataforma
              </h3>
              <div class="prose prose-slate max-w-none prose-p:text-sm prose-li:text-sm text-slate-600 leading-relaxed">
                 ${ai.platformAnalysis}
              </div>
           </div>
        </div>

        <!-- Right Column -->
        <div class="col-span-4">
           <div class="bg-[#0f172a] p-6 rounded-xl shadow-lg relative overflow-hidden text-white flex flex-col">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[${aColor}] opacity-20 blur-[50px] rounded-full -mr-8 -mt-8 pointer-events-none"></div>
              <h4 class="font-bold text-white mb-6 flex items-center gap-2 text-base relative z-10 border-b border-white/10 pb-4">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M12 2v4"/><path d="m4.9 4.9 2.9 2.9"/><path d="M2 12h4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M12 22v-4"/><path d="m19.1 19.1-2.9-2.9"/><path d="M22 12h-4"/><path d="m19.1 4.9-2.9 2.9"/></svg>
                 Oportunidades & Aprendizajes
              </h4>
              <div class="relative z-10">
                <ul class="space-y-4">
                   ${(ai.recommendations || []).map(r => `
                      <li class="flex items-start gap-3 text-sm text-gray-300 leading-relaxed group">
                         <span class="mt-1.5 min-w-[5px] h-[5px] rounded-full bg-[${aColor}] shadow-[0_0_6px_${aColor}] group-hover:scale-125 transition-transform"></span>
                         <span>${r}</span>
                      </li>
                   `).join('')}
                </ul>
              </div>
           </div>
        </div>
      </div>

      <!-- Charts Area -->
      <div class="grid grid-cols-2 gap-6 mb-8">
         <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <h4 class="font-bold text-slate-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wide">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span> Facebook: Alcance
            </h4>
            <div class="h-[250px] w-full"><canvas id="fbChart"></canvas></div>
         </div>
         <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <h4 class="font-bold text-slate-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wide">
              <span class="w-2 h-2 rounded-full bg-pink-500"></span> Instagram: Alcance
            </h4>
            <div class="h-[250px] w-full"><canvas id="igChart"></canvas></div>
         </div>
      </div>

      <!-- NEW: Combined Organic Chart -->
      <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm mb-8">
         <h4 class="font-bold text-slate-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wide">
             <span class="w-2 h-2 rounded-full bg-purple-600"></span> Total Visualizaciones (FB + IG) - Crecimiento Acumulado
         </h4>
         <div class="h-[300px] w-full"><canvas id="organicCombinedChart"></canvas></div>
      </div>
      
      <!-- Top Posts Table -->
      <div class="col-span-12 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-8">
          <div class="p-4 border-b border-slate-100 bg-slate-50/50">
             <h3 class="font-bold text-slate-800 text-sm">Detalle: Top Contenido Orgánico</h3>
          </div>
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr><th class="p-3">Post</th><th class="p-3">Tipo</th><th class="p-3 text-right">Alcance</th><th class="p-3 text-right">Eng.</th></tr>
            </thead>
            <tbody>
              ${rrss.topPosts.slice(0, 5).map((p, i) => `
                <tr class="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td class="p-3">
                     <div class="flex items-center gap-3">
                        <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">${i + 1}</span>
                        <span class="truncate max-w-[250px] font-medium text-slate-900" title="${p.title}">${p.title}</span>
                     </div>
                  </td>
                  <td class="p-3"><span class="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-semibold text-slate-600 uppercase tracking-wide">${p.type}</span></td>
                  <td class="p-3 text-right font-mono text-slate-600">${p.reach.toLocaleString()}</td>
                  <td class="p-3 text-right font-mono text-[${aColor}] font-bold">${p.engagement.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
      </div>
      
      <!-- Closing Text -->
      <div class="bg-[${aColor}]/5 border border-[${aColor}]/20 p-6 rounded-xl text-center">
         <p class="text-slate-700 font-medium italic text-sm">"${ai.closingText || 'Seguimos creciendo con consistencia.'}"</p>
      </div>

    </div>
    `;
  }

  // 2. GENERATE PAUTA SECTION HTML
  if (processedData.hasPauta && aiInterpretations.pauta) {
    const pauta = processedData.pauta;
    const ai = aiInterpretations.pauta;

    pautaSection = `
    <!-- PAUTA SECTION -->
    <div class="page-break"></div>
    <div class="max-w-6xl mx-auto p-12">
      <div class="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Digital (Ads)</h2>
        <span class="text-[${aColor}] font-bold text-lg tracking-wider">META ADS</span>
      </div>

      <!-- KPIs Pauta -->
      <div class="grid grid-cols-4 gap-4 mb-8">
        <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl shadow-lg relative overflow-hidden col-span-1">
           <div class="absolute top-0 right-0 w-20 h-20 bg-white opacity-5 rounded-full -mr-8 -mt-8"></div>
           <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Inversión Total</p>
           <p class="text-2xl font-extrabold tracking-tight">$${pauta.totalSpend.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 col-span-1 group hover:border-[${aColor}] transition-colors">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conversiones</p>
          <p class="text-2xl font-extrabold text-slate-900">${pauta.totalConversions.toLocaleString()}</p>
          <p class="text-[9px] text-green-500 font-bold mt-1 bg-green-50 inline-block px-1.5 py-0.5 rounded-full uppercase">Resultados Clave</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 col-span-1 group hover:border-[${aColor}] transition-colors">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Impresiones</p>
          <p class="text-2xl font-extrabold text-slate-900">${pauta.totalImpressions.toLocaleString()}</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 col-span-1 group hover:border-[${aColor}] transition-colors">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Alcance</p>
          <p class="text-2xl font-extrabold text-[${aColor}]">${pauta.totalReach ? pauta.totalReach.toLocaleString() : 'N/D'}</p>
        </div>
      </div>

      <!-- Main Analysis Grid -->
      <div class="grid grid-cols-12 gap-6 mb-8 items-start">
        <div class="col-span-8 flex flex-col gap-6">
           <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div class="absolute top-0 left-0 w-1 h-full bg-slate-900"></div>
              <h3 class="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <span class="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-900">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                 </span>
                 Análisis Estratégico de Desempeño
              </h3>
              <div class="prose prose-slate max-w-none prose-p:text-sm prose-li:text-sm prose-strong:text-slate-900 prose-ul:list-disc prose-ul:pl-4 text-slate-600 leading-relaxed">
                 ${ai.adsExecutiveSummary}
              </div>
           </div>

           <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 class="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <span class="w-6 h-6 rounded bg-[${aColor}]/10 flex items-center justify-center text-[${aColor}]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                 </span>
                 ¿Qué funcionó mejor?
              </h3>
              <div class="prose prose-slate max-w-none prose-p:text-sm prose-li:text-sm prose-strong:text-[${aColor}] prose-ul:list-none prose-ul:space-y-2 text-slate-600 leading-relaxed">
                 ${ai.optimizationOpportunities}
              </div>
           </div>
        </div>

        <div class="col-span-4">
           <div class="bg-[#0f172a] p-6 rounded-xl shadow-lg relative overflow-hidden text-white flex flex-col">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[${aColor}] opacity-20 blur-[50px] rounded-full -mr-8 -mt-8 pointer-events-none"></div>
              <h4 class="font-bold text-white mb-6 flex items-center gap-2 text-base relative z-10 border-b border-white/10 pb-4">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M12 2v4"/><path d="m4.9 4.9 2.9 2.9"/><path d="M2 12h4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M12 22v-4"/><path d="m19.1 19.1-2.9-2.9"/><path d="M22 12h-4"/><path d="m19.1 4.9-2.9 2.9"/></svg>
                 Recomendaciones Estratégicas
              </h4>
              <div class="relative z-10">
                <ul class="space-y-4">
                   ${(ai.adsRecommendations || []).map(r => `
                      <li class="flex items-start gap-3 text-sm text-gray-300 leading-relaxed group">
                         <span class="mt-1.5 min-w-[5px] h-[5px] rounded-full bg-[${aColor}] shadow-[0_0_6px_${aColor}] group-hover:scale-125 transition-transform"></span>
                         <span>${r}</span>
                      </li>
                   `).join('')}
                </ul>
              </div>
           </div>
        </div>
      </div>

      <!-- NEW: Ads Charts (Side by Side) -->
      <div class="grid grid-cols-2 gap-6 mb-8">
         <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <h4 class="font-bold text-slate-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wide">
              <span class="w-2 h-2 rounded-full bg-slate-900"></span> Ads: Alcance Acumulado
            </h4>
            <div class="h-[250px] w-full"><canvas id="adsReachChart"></canvas></div>
         </div>
         <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <h4 class="font-bold text-slate-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wide">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Ads: Impresiones Acumuladas
            </h4>
            <div class="h-[250px] w-full"><canvas id="adsImpressionsChart"></canvas></div>
         </div>
      </div>
      
      <!-- Closing Text -->
      <div class="bg-[${aColor}]/5 border border-[${aColor}]/20 p-6 rounded-xl text-center">
         <p class="text-slate-700 font-medium italic text-sm">"${ai.closingText || 'Continuamos optimizando para superar los objetivos planteados.'}"</p>
      </div>

    </div>
    `;
  }

  // --- HTML TEMPLATE ---
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${year}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #fff; color: #1a1a1a; -webkit-print-color-adjust: exact; }
    .page-break { page-break-before: always; }
    .card-shadow { box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05); }
    @media print { 
      .no-print { display: none; } 
      .print-padding { padding: 0; } 
      body { background-color: white; }
      .bg-slate-50 { background-color: #f8fafc !important; } 
      .break-inside-avoid { break-inside: avoid; } 
    }
  </style>
</head>
<body class="bg-slate-50 print-padding">
  
  <!-- Cover Page -->
  <div class="min-h-[100vh] flex flex-col justify-between p-12 lg:p-20 bg-white relative overflow-hidden">
    <!-- Decorative Elements -->
    <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[${aColor}]/10 to-transparent rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
    <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[${sColor}]/10 to-transparent rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
    
    <div class="relative z-10 pt-10">
      ${logo ? `<img src="${logo}" alt="Logo" class="h-32 object-contain mb-16 drop-shadow-sm">` : '<div class="h-32 mb-16 w-32 bg-slate-100 rounded-xl animate-pulse"></div>'}
      
      <div class="inline-block px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-sm font-bold text-slate-500 uppercase tracking-widest mb-10">
        Reporte Oficial
      </div>
      
      <h1 class="text-7xl lg:text-8xl font-extrabold text-slate-900 leading-[1.1] mb-8 max-w-5xl tracking-tight">
        ${title}
      </h1>
      <p class="text-3xl text-slate-500 font-light tracking-wide">Estrategia & Resultados • ${year}</p>
    </div>

    <div class="relative z-10 border-t border-slate-100 pt-12">
      <div class="grid grid-cols-2 gap-12 max-w-2xl">
        <div>
          <p class="text-xs uppercase tracking-widest text-slate-400 mb-2 font-bold">Creado por</p>
          <p class="text-xl font-bold text-slate-900">Brainstudio Agencia</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-widest text-slate-400 mb-2 font-bold">Fecha de Emisión</p>
          <p class="text-xl font-bold text-slate-900">${dateStr}</p>
        </div>
      </div>
    </div>
  </div>

  ${rrssSection}
  ${pautaSection}

  <!-- Final Footer -->
  <footer class="max-w-6xl mx-auto p-12 text-center mt-12 page-break flex flex-col items-center justify-center min-h-[50vh]">
    <div class="mb-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
      ${logo ? `<img src="${logo}" alt="Logo" class="h-16 object-contain">` : ''}
    </div>
    <h3 class="text-2xl font-bold text-slate-900 mb-2">Brainstudio Agencia</h3>
    <p class="text-slate-400 text-sm font-medium">Reporte estratégico de desempeño digital</p>
  </footer>

  <script>
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.color = '#64748b';
    Chart.defaults.scale.grid.color = '#f1f5f9';
    
    // RRSS Charts
    if (document.getElementById('fbChart')) {
       const ctx = document.getElementById('fbChart').getContext('2d');
       let gradient = ctx.createLinearGradient(0, 0, 0, 250);
       gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
       gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
       new Chart(ctx, {
         type: 'line',
         data: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], datasets: [{ label: 'Alcance Facebook', data: [${fbChartDataStr}], borderColor: '#3b82f6', borderWidth: 3, backgroundColor: gradient, fill: true, tension: 0.4 }] },
         options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, border: {display: false} }, x: { grid: { display: false }, border: {display: false} } } }
       });
    }

    if (document.getElementById('igChart')) {
       const ctx = document.getElementById('igChart').getContext('2d');
       let gradient = ctx.createLinearGradient(0, 0, 0, 250);
       gradient.addColorStop(0, 'rgba(236, 72, 153, 0.2)');
       gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
       new Chart(ctx, {
         type: 'line',
         data: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], datasets: [{ label: 'Alcance Instagram', data: [${igChartDataStr}], borderColor: '#ec4899', borderWidth: 3, backgroundColor: gradient, fill: true, tension: 0.4 }] },
         options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, border: {display: false} }, x: { grid: { display: false }, border: {display: false} } } }
       });
    }

    if (document.getElementById('organicCombinedChart')) {
       const ctx = document.getElementById('organicCombinedChart').getContext('2d');
       let gradient = ctx.createLinearGradient(0, 0, 0, 300);
       gradient.addColorStop(0, 'rgba(162, 52, 253, 0.2)');
       gradient.addColorStop(1, 'rgba(162, 52, 253, 0)');
       new Chart(ctx, {
         type: 'line',
         data: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], datasets: [{ label: 'Visualizaciones Totales', data: [${combinedOrganicDataStr}], borderColor: '#9333ea', borderWidth: 3, backgroundColor: gradient, fill: true, tension: 0.4, pointBackgroundColor: '#fff', pointBorderColor: '#9333ea', pointBorderWidth: 2, pointRadius: 5 }] },
         options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, border: {display: false} }, x: { grid: { display: false }, border: {display: false} } } }
       });
    }

    // Ads Charts
    if (document.getElementById('adsReachChart')) {
       const ctx = document.getElementById('adsReachChart').getContext('2d');
       let gradient = ctx.createLinearGradient(0, 0, 0, 250);
       gradient.addColorStop(0, 'rgba(15, 23, 42, 0.2)');
       gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
       new Chart(ctx, {
         type: 'line',
         data: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], datasets: [{ label: 'Alcance Ads', data: [${adsReachDataStr}], borderColor: '#0f172a', borderWidth: 3, backgroundColor: gradient, fill: true, tension: 0.4, pointBackgroundColor: '#fff', pointBorderColor: '#0f172a', pointBorderWidth: 2, pointRadius: 4 }] },
         options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, border: {display: false} }, x: { grid: { display: false }, border: {display: false} } } }
       });
    }

    if (document.getElementById('adsImpressionsChart')) {
       const ctx = document.getElementById('adsImpressionsChart').getContext('2d');
       let gradient = ctx.createLinearGradient(0, 0, 0, 250);
       gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
       gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
       new Chart(ctx, {
         type: 'line',
         data: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], datasets: [{ label: 'Impresiones Ads', data: [${adsImpressionsDataStr}], borderColor: '#10b981', borderWidth: 3, backgroundColor: gradient, fill: true, tension: 0.4, pointBackgroundColor: '#fff', pointBorderColor: '#10b981', pointBorderWidth: 2, pointRadius: 4 }] },
         options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, border: {display: false} }, x: { grid: { display: false }, border: {display: false} } } }
       });
    }
  </script>
</body>
</html>`;
}