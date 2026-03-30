import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS
const corsOptions = {
  origin: 'https://metrics.brainstudioagencia.com',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Intelligence API' });
});

// Endpoint de análisis de IA
app.post('/api/ai-analysis', async (req, res) => {
  try {
    const { prompt, model: requestedModel } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Falta el prompt en la petición' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.4';

    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY no está configurada en las variables de entorno');
      return res.status(500).json({ error: 'Configuración del servidor incompleta (API Key)' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: requestedModel || OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Eres un consultor experto en marketing digital. Responde siempre en JSON válido y bien estructurado.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error de OpenAI:', data);

      // Fallback a gpt-4o si gpt-5.4 falla o no existe
      if (OPENAI_MODEL === 'gpt-5.4' && response.status === 404) {
        console.log('Intentando fallback a gpt-4o...');
        const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'Eres un consultor experto en marketing digital. Responde siempre en JSON válido y bien estructurado.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
          })
        });

        const fallbackData = await fallbackResponse.json();
        return res.status(fallbackResponse.status).json(fallbackData);
      }

      return res.status(response.status).json(data);
    }

    res.json(data);

  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({ error: 'Error interno al procesar el análisis de IA' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Intelligence API corriendo en el puerto ${PORT}`);
});
