import { Router, type Request, type Response } from 'express'

const router = Router()

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

/**
 * POST /api/interview/generate-panel
 *
 * Body: { tableId: number, sceneDescription: string, caption?: string, speechBubble?: string, direction: string }
 * Returns: { imageUrl: string } (base64 data URL)
 *
 * Generates an X-Men '97 style comic panel from the table's submission.
 * Image is returned as base64 — the client stores it or displays it directly.
 */
router.post('/generate-panel', async (req: Request, res: Response) => {
  const { tableId, sceneDescription, caption, speechBubble, direction } = req.body

  if (!sceneDescription && !caption) {
    return res.status(400).json({ error: 'Need at least a scene description or caption' })
  }

  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: 'Image generation not available' })
  }

  // Build the image prompt from participant submissions
  const sceneText = sceneDescription || caption || ''
  const moodMap: Record<string, string> = {
    HOME: 'Warm golden light, domestic setting, 1920s Croydon England. A sense of belonging and origin.',
    NIGHT: 'Warm amber club lighting, art deco interior, 1940s London jazz club. Energy, glamour, danger.',
    FIRE: 'Sharp dramatic lighting, 1930s London political meeting room. Determination, defiance, purpose.',
    THRESHOLD: 'Bright daylight, dockside, 1948 Tilbury England. Hope, arrival, a door being held open.',
    SHADOW: 'Deep shadows, silhouette, minimal detail. Absence, silence, what was never recorded.',
    SILENCE: 'Cold muted tones, empty room, an unopened suitcase. Loss, erasure, thirty years of nothing.',
    RETURN: 'Warm light emerging from shadow, archive papers, photographs. Recovery, detective work, bringing something back.',
  }

  const mood = moodMap[direction] || 'Dramatic lighting, 1940s Britain.'

  const prompt = `Comic book panel artwork in the style of X-Men '97 animated series (1990s Marvel cel animation). Bold black outlines, clean cel-shading, saturated colours, dramatic shadow work, cinematic composition.

Setting: ${mood}

Scene: ${sceneText}

The subject is a Black man, dignified, elegant — 1940s-1950s Britain. Strong presence, expressive face.

Style requirements:
- Single comic panel with thick black border
- Bold cel-shaded colouring (not photorealistic)
- Dramatic lighting with strong shadows
- Gold (#FFD700) and black (#0A0A0A) as accent colours
- Composition suitable for a comic strip frame
- NO text, NO speech bubbles, NO captions, NO watermarks, NO logos in the image
- Horizontal 16:9 format`

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
          imageSizeOptions: { aspectRatio: '16:9' },
        }
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error(`Gemini image error (table ${tableId}):`, errText)
      return res.status(502).json({ error: 'Image generation failed' })
    }

    const data = await response.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            inlineData?: { mimeType: string; data: string }
            text?: string
          }>
        }
      }>
    }

    // Extract image from Gemini response
    const parts = data.candidates?.[0]?.content?.parts || []
    const imagePart = parts.find(p => p.inlineData)

    if (!imagePart?.inlineData) {
      console.error(`Gemini returned no image (table ${tableId})`)
      return res.status(502).json({ error: 'No image generated' })
    }

    const { mimeType, data: base64 } = imagePart.inlineData
    const imageUrl = `data:${mimeType};base64,${base64}`

    return res.json({ imageUrl, tableId })
  } catch (err) {
    console.error(`Panel image error (table ${tableId}):`, err)
    return res.status(500).json({ error: 'Image generation temporarily unavailable' })
  }
})

export default router
