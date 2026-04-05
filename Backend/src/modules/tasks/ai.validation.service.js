import axios from 'axios';

export async function validateTaskWithAI(imageBuffer, taskName) {
  try {
    const base64Image = imageBuffer.toString('base64');

    const prompt = `
    Eres un sistema de validación de tareas domésticas basado en imágenes.

    TAREA A VALIDAR:
    "${taskName}"

    OBJETIVO:
    Determinar si la tarea indicada ha sido correctamente realizada.

    INSTRUCCIONES:
    - Analiza la imagen teniendo en cuenta la tarea específica.
    - Evalúa SOLO si la tarea indicada está correctamente completada.
    - Sé estricto: si hay dudas, responde INVALID.

    CRITERIOS:
    - La imagen debe reflejar claramente que la tarea "${taskName}" está realizada.
    - Si faltan elementos clave → INVALID
    - Si está parcialmente hecha → INVALID
    - Si la imagen no permite confirmarlo → INVALID

    RESPUESTA:
    Devuelve SOLO un JSON válido:

    {
      "result": "VALID" o "INVALID",
      "confidence": número entre 0 y 1
    }`;
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ]
      },
      {
        timeout: 15000
      }
    );

    let text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("=== IA RESPONSE ===")
    console.log(text)
    console.log("===================")

    // LIMPIAR RESPUESTA 
    text = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      // fallback inteligente
      const lower = text.toLowerCase();

      const valid = lower.includes('valid') && !lower.includes('invalid');

      return {
        valid,
        confidence: 0.4 //baja confianza → forzará retry
      };
    }

    const result = parsed.result?.trim().toUpperCase();
    const valid = result === "VALID";

    let confidence = parsed.confidence;

    // 🔥 normalizar confidence
    if (typeof confidence !== 'number' || isNaN(confidence)) {
      confidence = valid ? 0.7 : 0.6;
    }

    // limitar rango
    confidence = Math.max(0, Math.min(1, confidence));

    return {
      valid,
      confidence
    };

  } catch (error) {
    console.error("AI ERROR:", error.response?.data || error.message);

    // fallback extremo
    return {
      valid: false,
      confidence: 0.3
    };
  }
}