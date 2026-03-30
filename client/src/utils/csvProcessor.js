export function processCSVData(rrssData = [], pautaData = []) {
  // --- HELPERS ---
  const parseNum = (val) => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return val;
    
    let str = String(val).trim();
    if (str === '-' || str === 'NaN') return 0;
    
    // Check format heuristic
    if (str.includes('.') && str.includes(',')) {
      const lastDot = str.lastIndexOf('.');
      const lastComma = str.lastIndexOf(',');
      if (lastComma > lastDot) {
        str = str.replace(/\./g, '').replace(',', '.'); // EU
      } else {
        str = str.replace(/,/g, ''); // US
      }
    } else if (str.includes(',')) {
       str = str.replace(',', '.');
    }
    
    const clean = str.replace(/[^\d.-]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const normalize = (str) => {
    if (!str) return '';
    return String(str).toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const getColValue = (row, possibleHeaders) => {
    const rowKeys = Object.keys(row);
    for (const header of possibleHeaders) {
      const target = normalize(header);
      let matchKey = rowKeys.find(k => normalize(k) === target);
      if (!matchKey) matchKey = rowKeys.find(k => normalize(k).startsWith(target));
      if (!matchKey) matchKey = rowKeys.find(k => normalize(k).includes(target));
      if (matchKey) return row[matchKey];
    }
    return undefined;
  };

  // --- INITIALIZE STRUCTURE ---
  const processed = {
    hasRRSS: rrssData && rrssData.length > 0,
    hasPauta: pautaData && pautaData.length > 0,
    
    // RRSS Structure
    rrss: {
      globalMetrics: {
        totalViews: 0,
        interactions: 0,
        followers: 0,
        profileVisits: 0,
        totalPosts: 0
      },
      quarterly: {
        facebook: { Q1: { reach: 0, engagement: 0 }, Q2: { reach: 0, engagement: 0 }, Q3: { reach: 0, engagement: 0 }, Q4: { reach: 0, engagement: 0 } },
        instagram: { Q1: { reach: 0, engagement: 0 }, Q2: { reach: 0, engagement: 0 }, Q3: { reach: 0, engagement: 0 }, Q4: { reach: 0, engagement: 0 } }
      },
      topPosts: [],
      contentTypeBreakdown: {},
      performanceCurve: {
        facebook: [],
        instagram: []
      }
    },

    // Pauta Structure
    pauta: {
      totalSpend: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalReach: 0,
      quarterly: {
        Q1: { spend: 0, impressions: 0, clicks: 0, conversions: 0, reach: 0 },
        Q2: { spend: 0, impressions: 0, clicks: 0, conversions: 0, reach: 0 },
        Q3: { spend: 0, impressions: 0, clicks: 0, conversions: 0, reach: 0 },
        Q4: { spend: 0, impressions: 0, clicks: 0, conversions: 0, reach: 0 }
      },
      campaigns: []
    }
  };

  // --- PROCESS RRSS ---
  if (processed.hasRRSS) {
    rrssData.forEach((row, index) => {
      if (Object.keys(row).length < 2) return;

      const views = parseNum(getColValue(row, ['Visualizaciones', 'Impressions', 'Views', 'Vistas', 'Reproducciones', 'Impresiones']));
      const reach = parseNum(getColValue(row, ['Alcance', 'Reach', 'People Reached', 'Personas alcanzadas', 'Cuentas alcanzadas']));
      const likes = parseNum(getColValue(row, ['Me gusta', 'Likes', 'Reactions', 'Reacciones']));
      const comments = parseNum(getColValue(row, ['Comentarios', 'Comments']));
      const shares = parseNum(getColValue(row, ['Veces que se compartio', 'Shares', 'Compartidos', 'Veces compartido']));
      
      let engagement = parseNum(getColValue(row, ['Interacciones', 'Engagement', 'Post engagement', 'Interacciones con la publicacion']));
      if (engagement === 0) engagement = likes + comments + shares;

      const followers = parseNum(getColValue(row, ['Seguimientos', 'Follows', 'New followers', 'Nuevos seguidores', 'Seguidores']));
      const visits = parseNum(getColValue(row, ['Visitas al perfil', 'Profile visits']));
      
      processed.rrss.globalMetrics.totalViews += (views || reach);
      processed.rrss.globalMetrics.interactions += engagement;
      processed.rrss.globalMetrics.profileVisits += visits;
      processed.rrss.globalMetrics.followers += followers;
      processed.rrss.globalMetrics.totalPosts += 1;

      // Platform Detection
      const rawType = String(getColValue(row, ['Tipo de publicacion', 'Type', 'Content Type', 'Tipo de contenido', 'Tipo']) || 'Unknown');
      const platformCol = getColValue(row, ['Plataforma', 'Platform', 'Red Social', 'Source', 'Fuente']);
      
      let platform = 'unknown';
      if (platformCol) {
          const pStr = String(platformCol).toLowerCase();
          if (pStr.includes('facebook')) platform = 'facebook';
          else if (pStr.includes('instagram')) platform = 'instagram';
      }
      if (platform === 'unknown') {
          if (rawType.toLowerCase().includes('instagram')) platform = 'instagram';
          else if (rawType.toLowerCase().includes('facebook')) platform = 'facebook';
      }
      const rowString = Object.values(row).join(' ').toLowerCase();
      if (platform === 'unknown') {
         if (rowString.includes('facebook')) platform = 'facebook';
         else if (rowString.includes('instagram')) platform = 'instagram';
      }

      // Content Type
      let simpleType = 'Post';
      if (rawType.toLowerCase().includes('reel')) simpleType = 'Reel';
      else if (rawType.toLowerCase().includes('imagen') || rawType.toLowerCase().includes('image') || rawType.toLowerCase().includes('foto')) simpleType = 'Image';
      else if (rawType.toLowerCase().includes('video')) simpleType = 'Video';
      else if (rawType.toLowerCase().includes('story') || rawType.toLowerCase().includes('historia')) simpleType = 'Story';

      if (!processed.rrss.contentTypeBreakdown[simpleType]) {
        processed.rrss.contentTypeBreakdown[simpleType] = { count: 0, views: 0, engagement: 0 };
      }
      processed.rrss.contentTypeBreakdown[simpleType].count += 1;
      processed.rrss.contentTypeBreakdown[simpleType].views += (views || reach);
      processed.rrss.contentTypeBreakdown[simpleType].engagement += engagement;

      // Quarterly Data
      const dateStr = String(getColValue(row, ['Hora de publicacion', 'Date', 'Time', 'Fecha', 'Publicado', 'Fecha de publicacion']) || '');
      const quarter = getQuarterFromDate(dateStr);
      const chartMetric = reach || views;

      if (quarter) {
         if (platform === 'facebook' && processed.rrss.quarterly.facebook[quarter]) {
           processed.rrss.quarterly.facebook[quarter].reach += chartMetric;
           processed.rrss.quarterly.facebook[quarter].engagement += engagement;
         } else if (platform === 'instagram' && processed.rrss.quarterly.instagram[quarter]) {
           processed.rrss.quarterly.instagram[quarter].reach += chartMetric;
           processed.rrss.quarterly.instagram[quarter].engagement += engagement;
         }
      }

      // Performance Curve Data
      if (dateStr) {
        const dateObj = getQuarterFromDate(dateStr, true);
        if (dateObj) {
          if (platform === 'facebook') {
             processed.rrss.performanceCurve.facebook.push({
                date: dateObj.toISOString(),
                metric: chartMetric,
                engagement: engagement
             });
          } else if (platform === 'instagram' || rowString.includes('instagram')) {
             const igMetric = views + reach + likes;
             processed.rrss.performanceCurve.instagram.push({
                 date: dateObj.toISOString(),
                 metric: igMetric,
                 engagement: engagement
             });
          } else if (rowString.includes('facebook')) {
             processed.rrss.performanceCurve.facebook.push({
                date: dateObj.toISOString(),
                metric: chartMetric,
                engagement: engagement
             });
          }
        }
      }

      // Top Posts
      const description = String(getColValue(row, ['Descripcion', 'Description', 'Message', 'Caption', 'Mensaje', 'Texto']) || '');
      if ((description || views > 0) && description !== 'Total') {
        processed.rrss.topPosts.push({
            title: description.length > 80 ? description.substring(0, 80) + '...' : (description || 'Sin título'),
            reach: reach || views,
            engagement: engagement,
            platform: platform === 'unknown' ? 'General' : platform,
            type: simpleType,
            date: dateStr
        });
      }
    });

    processed.rrss.performanceCurve.facebook.sort((a, b) => new Date(a.date) - new Date(b.date));
    processed.rrss.performanceCurve.instagram.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Cumulative IG Curve
    let igCumulative = 0;
    processed.rrss.performanceCurve.instagram = processed.rrss.performanceCurve.instagram.map(point => {
        igCumulative += point.metric;
        return { ...point, metric: igCumulative };
    });

    processed.rrss.topPosts.sort((a, b) => b.reach - a.reach);
    processed.rrss.topPosts = processed.rrss.topPosts.slice(0, 20);
  }

  // --- PROCESS PAUTA ---
  if (processed.hasPauta) {
    pautaData.forEach((row) => {
        if (Object.keys(row).length < 2) return;

        const spend = parseNum(getColValue(row, ['Importe gastado', 'Amount spent', 'Cost', 'Gasto', 'Inversion', 'Costo total']));
        const impressions = parseNum(getColValue(row, ['Impresiones', 'Impressions']));
        const reach = parseNum(getColValue(row, ['Alcance', 'Reach', 'Personas alcanzadas', 'Cuentas alcanzadas']));
        const clicks = parseNum(getColValue(row, ['Clics en el enlace', 'Link clicks', 'Clics (todos)', 'Clicks (all)', 'Clics', 'Enlace: Clics']));
        const conversions = parseNum(getColValue(row, ['Resultados', 'Results', 'Conversions', 'Conversiones', 'Total de resultados']));
        const conversionValue = parseNum(getColValue(row, ['Valor de conversion', 'Conversion value', 'Valor de los resultados', 'Valor total de conversiones']));
        const cprCol = parseNum(getColValue(row, ['Costo por resultado', 'Cost per result', 'CPR', 'Costo por conversion']));
        const roasCol = parseNum(getColValue(row, ['ROAS', 'Retorno de la inversion', 'Purchase ROAS']));
        const campaignName = String(getColValue(row, ['Nombre de la campaña', 'Campaign name']) || 'Unknown');
        
        // Globals
        processed.pauta.totalSpend += spend;
        processed.pauta.totalImpressions += impressions;
        processed.pauta.totalClicks += clicks;
        processed.pauta.totalConversions += conversions;
        processed.pauta.totalReach += reach; 

        // Quarterly Aggregation (New Logic)
        const dateStr = String(getColValue(row, ['Dia', 'Day', 'Fecha', 'Date', 'Inicio', 'Start Date', 'Time', 'Starts']) || '');
        const quarter = getQuarterFromDate(dateStr);
        if (quarter) {
           processed.pauta.quarterly[quarter].spend += spend;
           processed.pauta.quarterly[quarter].impressions += impressions;
           processed.pauta.quarterly[quarter].clicks += clicks;
           processed.pauta.quarterly[quarter].conversions += conversions;
           processed.pauta.quarterly[quarter].reach += reach;
        }

        // Campaigns
        if (campaignName !== 'Unknown' && campaignName !== 'Total') {
            let existingCampaign = processed.pauta.campaigns.find(c => c.name === campaignName);
            if (!existingCampaign) {
                existingCampaign = {
                    name: campaignName, spend: 0, impressions: 0, clicks: 0, conversions: 0, conversionValue: 0,
                    ctr: 0, cpc: 0, roas: 0, cpr: 0, explicitCpr: 0, explicitRoas: 0
                };
                processed.pauta.campaigns.push(existingCampaign);
            }
            existingCampaign.spend += spend;
            existingCampaign.impressions += impressions;
            existingCampaign.clicks += clicks;
            existingCampaign.conversions += conversions;
            existingCampaign.conversionValue += conversionValue;
            if (cprCol > 0) existingCampaign.explicitCpr = cprCol;
            if (roasCol > 0) existingCampaign.explicitRoas = roasCol;
        }
    });

    processed.pauta.campaigns.forEach(c => {
        c.ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
        c.cpc = c.clicks > 0 ? c.spend / c.clicks : 0;
        c.cpm = c.impressions > 0 ? (c.spend / c.impressions) * 1000 : 0;
        
        if (c.conversions > 0) c.cpr = c.spend / c.conversions;
        else if (c.explicitCpr > 0) c.cpr = c.explicitCpr;
        else c.cpr = 0;

        if (c.spend > 0 && c.conversionValue > 0) c.roas = c.conversionValue / c.spend;
        else if (c.explicitRoas > 0) c.roas = c.explicitRoas;
        else c.roas = 0;
    });

    processed.pauta.campaigns.sort((a, b) => b.spend - a.spend);
  }

  console.log("CSV Processing Complete", processed);
  return processed;
}

function getQuarterFromDate(dateString, returnDateObj = false) {
  if (!dateString) return null;
  
  let date;
  const ddmmyyyy = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/.exec(dateString);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    date = new Date(year, month, day);
  } else {
    date = new Date(dateString);
  }

  if (isNaN(date.getTime())) return null;
  if (returnDateObj) return date;

  const month = date.getMonth() + 1;
  if (month >= 1 && month <= 3) return 'Q1';
  if (month >= 4 && month <= 6) return 'Q2';
  if (month >= 7 && month <= 9) return 'Q3';
  if (month >= 10 && month <= 12) return 'Q4';

  return null;
}