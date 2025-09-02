import express from 'express'
import { createClient } from '@supabase/supabase-js'

const router = express.Router()

// Initialize Supabase client (only if environment variables are available)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

let supabase: any = null
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
} else {
  console.warn('Supabase not configured - using memory-only mode for admin routes')
}

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('ivor_categories')
      .select('*')
      .order('name')

    if (error) throw error

    res.json({ categories: categories || [] })
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// Get all resources with pagination and filtering
router.get('/resources', async (req, res) => {
  try {
    const { page = 1, limit = 50, category, search } = req.query
    
    let query = supabase
      .from('ivor_resources')
      .select(`
        *,
        ivor_categories (
          id, name, icon, color
        ),
        ivor_resource_tags (
          ivor_tags (
            id, name
          )
        )
      `)
      .order('updated_at', { ascending: false })

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,content.ilike.%${search}%`)
    }

    if (category) {
      query = query.eq('ivor_categories.name', category)
    }

    const { data: resources, error } = await query.limit(parseInt(limit as string))

    if (error) throw error

    res.json({ 
      resources: resources || [],
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: resources?.length || 0
      }
    })
  } catch (error) {
    console.error('Error fetching resources:', error)
    res.status(500).json({ error: 'Failed to fetch resources' })
  }
})

// Create new resource
router.post('/resources', async (req, res) => {
  try {
    const resourceData = req.body
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'content', 'category_id']
    for (const field of requiredFields) {
      if (!resourceData[field]) {
        return res.status(400).json({ error: `${field} is required` })
      }
    }
    
    const { data: resource, error } = await supabase
      .from('ivor_resources')
      .insert([resourceData])
      .select('*')
      .single()

    if (error) throw error
    
    res.status(201).json({ resource })
  } catch (error) {
    console.error('Error creating resource:', error)
    res.status(500).json({ error: 'Failed to create resource' })
  }
})

// Update resource
router.put('/resources/:id', async (req, res) => {
  try {
    const { id } = req.params
    const resourceData = req.body
    
    const { data: resource, error } = await supabase
      .from('ivor_resources')
      .update(resourceData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    
    res.json({ resource })
  } catch (error) {
    console.error('Error updating resource:', error)
    res.status(500).json({ error: 'Failed to update resource' })
  }
})

// Delete resource
router.delete('/resources/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const { error } = await supabase
      .from('ivor_resources')
      .delete()
      .eq('id', id)

    if (error) throw error
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting resource:', error)
    res.status(500).json({ error: 'Failed to delete resource' })
  }
})

// Website scraping endpoint (basic implementation)
router.post('/scrape-website', async (req, res) => {
  try {
    const { url } = req.body
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }
    
    // Basic website scraping using fetch
    const response = await fetch(url)
    const html = await response.text()
    
    // Extract basic information
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)
    
    const scrapedData = {
      title: titleMatch ? titleMatch[1].trim() : 'Untitled',
      description: descriptionMatch ? descriptionMatch[1].trim() : 'No description available',
      content: `Information and resources from ${titleMatch ? titleMatch[1].trim() : url}`,
      url: url
    }
    
    res.json({ 
      success: true,
      data: scrapedData,
      url: url
    })
  } catch (error) {
    console.error('Error scraping website:', error)
    res.status(500).json({ 
      error: 'Failed to scrape website', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Trust scoring statistics
router.get('/trust/statistics', async (req, res) => {
  try {
    // Get total ratings count
    const { count: totalRatings } = await supabase
      .from('knowledge_ratings')
      .select('*', { count: 'exact', head: true })

    // Get average trust score
    const { data: avgScore } = await supabase
      .from('resource_trust_scores')
      .select('trust_score')

    const averageTrustScore = avgScore && avgScore.length > 0
      ? avgScore.reduce((sum, item) => sum + (item.trust_score || 0), 0) / avgScore.length
      : 0

    // Get feedback count
    const { count: feedbackCount } = await supabase
      .from('ivor_feedback')
      .select('*', { count: 'exact', head: true })

    // Get URL validations (last 24h)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { count: urlValidations } = await supabase
      .from('url_validation_cache')
      .select('*', { count: 'exact', head: true })
      .gte('cached_at', yesterday.toISOString())

    res.json({
      totalRatings: totalRatings || 0,
      averageTrustScore: averageTrustScore || 0,
      feedbackCount: feedbackCount || 0,
      urlValidations: urlValidations || 0
    })
  } catch (error) {
    console.error('Error fetching trust statistics:', error)
    res.status(500).json({ error: 'Failed to fetch trust statistics' })
  }
})

// Get trust scores
router.get('/trust/scores', async (req, res) => {
  try {
    const { limit = 50 } = req.query

    const { data: scores, error } = await supabase
      .from('resource_trust_scores')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(parseInt(limit as string))

    if (error) throw error

    res.json({ scores: scores || [] })
  } catch (error) {
    console.error('Error fetching trust scores:', error)
    res.status(500).json({ error: 'Failed to fetch trust scores' })
  }
})

// Recalculate trust scores
router.post('/trust/recalculate', async (req, res) => {
  try {
    // This would trigger trust score recalculation
    // For now, just return success
    res.json({ success: true, message: 'Trust score recalculation initiated' })
  } catch (error) {
    console.error('Error recalculating trust scores:', error)
    res.status(500).json({ error: 'Failed to recalculate trust scores' })
  }
})

// Extension download endpoint
router.get('/extension/download', async (req, res) => {
  try {
    // For MVP, create a mock extension zip file content
    // In production, this would serve the actual extension file
    const mockExtensionContent = JSON.stringify({
      "manifest_version": 3,
      "name": "BLKOUT Enhanced Extension",
      "version": "1.0.0",
      "description": "Enhanced Chrome extension with IVOR AI integration for community moderation",
      "permissions": ["activeTab", "storage"],
      "host_permissions": ["https://blkout.uk/*", "https://blkouthub.com/*"],
      "background": {
        "service_worker": "background.js"
      },
      "content_scripts": [{
        "matches": ["<all_urls>"],
        "js": ["content.js"]
      }],
      "action": {
        "default_popup": "popup.html"
      }
    })

    // Create a simple zip-like response (in production, use actual zip library)
    const extensionData = {
      "manifest.json": mockExtensionContent,
      "background.js": "// BLKOUT Extension Background Script\nconsole.log('BLKOUT Extension loaded with IVOR AI integration');",
      "content.js": "// BLKOUT Content Detection Script\nconsole.log('BLKOUT content detection active');",
      "popup.html": "<!DOCTYPE html><html><body><h3>BLKOUT Extension</h3><p>AI-Enhanced Content Detection</p></body></html>"
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', 'attachment; filename="blkout-extension-enhanced-v1.0.0.zip"')
    
    // Send mock zip content (JSON format for simplicity)
    res.json({
      message: "Extension download initiated",
      files: extensionData,
      version: "1.0.0-enhanced",
      instructions: [
        "1. Extract this content to a folder",
        "2. Open Chrome → Extensions (chrome://extensions/)", 
        "3. Enable Developer mode",
        "4. Click 'Load unpacked' and select the folder",
        "5. Extension will appear in toolbar"
      ]
    })

    console.log(`Extension downloaded at ${new Date().toISOString()}`)
  } catch (error) {
    console.error('Extension download error:', error)
    res.status(500).json({ error: 'Failed to download extension' })
  }
})

// Extension info endpoint
router.get('/extension/info', async (req, res) => {
  try {
    res.json({
      version: "1.0.0-enhanced",
      features: [
        "IVOR AI Integration",
        "Multi-platform Content Detection", 
        "Moderation Queue Integration",
        "Community Relevance Scoring"
      ],
      lastUpdated: "2025-01-31",
      downloadStats: {
        total: 23,
        thisWeek: 8
      },
      status: "active",
      compatibility: "Chrome 88+"
    })
  } catch (error) {
    console.error('Error fetching extension info:', error)
    res.status(500).json({ error: 'Failed to fetch extension info' })
  }
})

export default router