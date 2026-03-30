// AI Analysis Service - Updated to use Centralized Backend API
const API_URL = import.meta.env.VITE_API_URL || 'https://api.brainstudioagencia.com/api/ai-analysis';

export async function generateAIInterpretations(processedData) {
  console.log("Generating AI Interpretations...", processedData);
  const tasks = [];
  const results = {
    rrss: null,
    pauta: null
  };

  // 1. Generate RRSS Analysis (Organic)
  if (processedData.hasRRSS) {
    let rrssContext = `
      CONTEXTO DE DATOS ORGÁNICOS (RRSS):
      - Alcance Total: ${processedData.rrss.globalMetrics.totalViews.toLocaleString()}
      - Interacciones: ${processedData.rrss.globalMetrics.interactions.toLocaleString()}
      - Seguidores Nuevos: ${processedData.rrss.globalMetrics.followers.toLocaleString()}
      - Visitas Perfil: ${processedData.rrss.globalMetrics.profileVisits.toLocaleString()}

      TOP POSTS:
      ${(processedData.rrss.topPosts || []).slice(0, 10).map((p, i) => `${i+1}. ${p.title} (${p.type}): Alcance ${p.reach}, Eng ${p.engagement}`).join('\n')}
    `;

    const rrssPrompt = `
      ${rrssContext}

      Actúa como analista de marketing digital y social media strategist. Con base en los CSV de redes sociales, analiza todo el desempeño orgánico (alcance, impresiones, interacciones, crecimiento, formatos y publicaciones). Elabora un informe conciso que incluya: resumen ejecutivo, análisis separado por red social, comparativo entre periodos si aplica, formatos y contenidos con mejor rendimiento, Top publicaciones y validación de consistencias de datos, explicando cualquier diferencia como control de calidad. Usa un lenguaje optimista, estratégico y constructivo, destacando avances y fortalezas. Expresa oportunidades como optimizaciones y aprendizajes, no hables en sentido negativo ni hables como si hubiese alguna inconsistencia o como si algo no estuviera funcionando. Presenta el resultado en bullets claros y finaliza con un párrafo corto listo para entregar al cliente, reforzando crecimiento, consistencia y valor estratégico de la gestión digital.
      
      IMPORTANTE: La sección de "Análisis de Contenido" debe ser concisa: usa máximo 3 párrafos cortos y algunos bullets puntos clave. Evita bloques de texto excesivos.

      IMPORTANTE: Devuelve la respuesta EXCLUSIVAMENTE en formato JSON válido con la siguiente estructura para generar tarjetas HTML:
      {
        "executiveSummary": "Texto HTML (usando <ul>, <li>, <strong>) para el Resumen Ejecutivo, destacando Logros y Avances.",
        "platformAnalysis": "Texto HTML (usando <ul>, <li>) con el análisis específico de Facebook e Instagram.",
        "contentAnalysis": "Texto HTML (usando <ul>, <li>) enfocado en Contenido Top, Formatos y qué funcionó mejor. Máximo 2 párrafos y bullets concisos.",
        "growthAnalysis": "Texto HTML breve sobre Crecimiento de comunidad y Seguidores nuevos.",
        "recommendations": ["Recomendación 1", "Recomendación 2", "Recomendación 3"],
        "closingText": "Párrafo corto de cierre."
      }
    `;

    tasks.push(
      fetchAI(rrssPrompt).then(res => {
        console.log("RRSS AI Result:", res);
        results.rrss = res;
      })
    );
  }

  // 2. Generate Pauta Analysis (Paid)
  if (processedData.hasPauta) {
    const pautaContext = `
      CONTEXTO DE DATOS PAUTA:
      - Inversión Total: $${processedData.pauta.totalSpend.toFixed(2)}
      - Impresiones: ${processedData.pauta.totalImpressions}
      - Clics: ${processedData.pauta.totalClicks}
      - Conversiones/Resultados: ${processedData.pauta.totalConversions}
      - CTR Global: ${(processedData.pauta.totalImpressions > 0 ? (processedData.pauta.totalClicks / processedData.pauta.totalImpressions * 100) : 0).toFixed(2)}%
      
      TOP CAMPAÑAS:
      ${(processedData.pauta.campaigns || []).slice(0, 5).map(c => 
        `- ${c.name}: Gasto $${c.spend}, Res ${c.conversions}, CPC $${c.cpc}, CTR ${c.ctr}%`
      ).join('\n')}
    `;

    const pautaPrompt = `
      ${pautaContext}

      Actúa como analista senior de paid media. Analiza en profundidad todos los datos del CSV de pauta (inversión, alcance, impresiones, clics, resultados, conversaciones, costos, campañas, conjuntos y anuncios). Elabora un informe breve y estratégico que incluya: resumen ejecutivo con métricas clave (excluyendo el CTR global), desempeño por plataforma, desglose por campañas/anuncios con mejor rendimiento, lectura de eficiencia de la inversión y validación de consistencia de datos (totales, importes gastados o variaciones), explicando cualquier diferencia como hallazgos de control de calidad. Usa un lenguaje optimista, estratégico y constructivo, destacando logros y avances. Expresa oportunidades como optimizaciones y aprendizajes, no hables en sentido negativo ni hables como si hubiese alguna inconsistencia o como si algo no estuviera funcionando. Formato obligatorio: bullets claros, sin párrafos largos. Cierra con un mensaje breve listo para el cliente que refuerce control, eficiencia y potencial de escalamiento de la inversión.

      IMPORTANTE: La sección de "¿Qué funcionó mejor?" (optimizationOpportunities) debe ser concisa: usa máximo 3 párrafos cortos y algunos bullets. Evita bloques de texto excesivos.

      IMPORTANTE: Devuelve la respuesta EXCLUSIVAMENTE en formato JSON válido con la siguiente estructura para ser renderizado en HTML:
      {
        "adsExecutiveSummary": "Texto HTML (usando <ul>, <li>, <strong>) para el Resumen Ejecutivo Estratégico.",
        "optimizationOpportunities": "Texto HTML (usando <ul>, <li>, <strong>) para Desglose de Rendimiento y Eficiencia. Máximo 3 párrafos y bullets concisos.",
        "adsRecommendations": ["Recomendación 1 (Optimización)", "Recomendación 2", "Recomendación 3", "Recomendación 4"],
        "closingText": "Mensaje de cierre listo para cliente."
      }
    `;

    tasks.push(
      fetchAI(pautaPrompt).then(res => {
        console.log("Pauta AI Result:", res);
        results.pauta = res;
      })
    );
  }

  await Promise.all(tasks);
  return results;
}

async function fetchAI(prompt) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt
      })
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("API Fetch Error:", response.status, response.statusText, errText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) throw new Error('Empty response content from AI');

    try {
        return JSON.parse(content);
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError, content);
        throw new Error("Failed to parse AI response as JSON");
    }

  } catch (error) {
    console.error("AI Service Overall Error:", error);
    // Return graceful fallback data so report doesn't crash
    return {
      executiveSummary: "⚠️ No se pudo generar el análisis. Error de conexión con el servicio de IA.",
      platformAnalysis: "Datos no disponibles temporalmente.",
      contentAnalysis: "Datos no disponibles temporalmente.",
      growthAnalysis: "Datos no disponibles temporalmente.",
      recommendations: ["Reintentar en unos momentos", "Contactar a soporte técnico si el problema persiste"],
      adsExecutiveSummary: "⚠️ Análisis no disponible. Error de conexión con el servidor.",
      optimizationOpportunities: "Datos no disponibles temporalmente.",
      adsRecommendations: ["Verificar conexión"],
      closingText: ""
    };
  }
}