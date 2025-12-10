import { GoogleGenAI } from "@google/genai";
import { VoteState, Question } from '../types';

export const generateVoteAnalysis = async (
  votes: VoteState,
  questions: Question[]
): Promise<string> => {
  
  // Obtenemos la key inyectada por vite.config.ts o desde el entorno directo
  // @ts-ignore
  const apiKey = process.env.API_KEY || (import.meta.env && import.meta.env.VITE_API_KEY);

  if (!apiKey) {
    console.error("API Key faltante. Asegúrate de configurar VITE_API_KEY en tu archivo .env");
    return "Error: API Key no configurada. No se puede generar el análisis. Avisale al administrador.";
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Format the votes for the prompt
  let votesSummary = "";
  questions.forEach((q) => {
    const selected = votes[q.id] || "Nadie";
    votesSummary += `- ${q.text}: ${selected}\n`;
  });

  const prompt = `
    Actúa como un amigo chismoso, ácido y muy argentino analizando las respuestas de una encuesta del grupo "Vladicamp 2025".
    Háblale directamente al usuario que votó (trátalo de "vos").

    Estas son sus elecciones:
    ${votesSummary}

    Genera un comentario divertido y picante (máximo 200 palabras) sobre cómo votó.
    - Menciona nombres específicos y qué dice eso de la relación del usuario con ellos. 
      (Ejemplo: "Che, pobre Tomi, lo mataste poniéndolo como el más negativo, se ve que no lo bancás mucho...").
    - Si repitió mucho a alguien, hacéselo notar (Ej: "Se ve que a [Nombre] lo tenés alquilado").
    - Búrlate de las elecciones contradictorias.
    - Usa jerga argentina coloquial.
    - El tono debe ser de complicidad pero "sacándole el cuero" a los amigos.
    - Devuelve el texto en formato Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Error generating content:", error);
    return "Ocurrió un error al intentar contactar al jurado de la IA. Intenta de nuevo.";
  }
};