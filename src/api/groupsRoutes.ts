/**
 * Community Groups Routes
 * Group management for community organizing
 *
 * Liberation Feature: Collective organizing spaces
 */

import { Router } from 'express'

const router = Router()

// In-memory stores for demo mode
const groups = new Map<string, any>()
const memberships = new Map<string, any[]>()

// Seed some demo groups
const seedGroups = () => {
  if (groups.size > 0) return

  const demoGroups = [
    {
      id: 'grp_london',
      name: 'BLKOUT London',
      slug: 'blkout-london',
      description: 'Community hub for Black queer folks in London',
      visibility: 'public',
      join_policy: 'open',
      category: 'Regional',
      location_focus: 'London',
      member_count: 234,
      event_count: 45,
      liberation_aligned: true,
      created_by: 'system',
      created_at: new Date('2024-01-01').toISOString()
    },
    {
      id: 'grp_manchester',
      name: 'BLKOUT Manchester',
      slug: 'blkout-manchester',
      description: 'Black queer community in Manchester',
      visibility: 'public',
      join_policy: 'open',
      category: 'Regional',
      location_focus: 'Manchester',
      member_count: 156,
      event_count: 28,
      liberation_aligned: true,
      created_by: 'system',
      created_at: new Date('2024-02-01').toISOString()
    },
    {
      id: 'grp_creatives',
      name: 'Black Queer Creatives',
      slug: 'black-queer-creatives',
      description: 'Artists, writers, musicians, and creators',
      visibility: 'public',
      join_policy: 'open',
      category: 'Interest',
      location_focus: 'UK-wide',
      member_count: 89,
      event_count: 12,
      liberation_aligned: true,
      created_by: 'system',
      created_at: new Date('2024-03-01').toISOString()
    },
    {
      id: 'grp_wellness',
      name: 'Wellness & Healing',
      slug: 'wellness-healing',
      description: 'Mental health, self-care, and healing practices',
      visibility: 'public',
      join_policy: 'approval',
      category: 'Wellness',
      location_focus: 'UK-wide',
      member_count: 67,
      event_count: 18,
      liberation_aligned: true,
      created_by: 'system',
      created_at: new Date('2024-04-01').toISOString()
    }
  ]

  demoGroups.forEach(g => groups.set(g.id, g))
}

seedGroups()

// ============================================
// Group Discovery Endpoints
// ============================================

/**
 * GET /api/groups
 * List all public groups
 */
router.get('/', async (req, res) => {
  try {
    const { category, location, search, page = 1, limit = 20 } = req.query

    let allGroups = Array.from(groups.values())
      .filter(g => g.visibility === 'public')

    // Filter by category
    if (category) {
      allGroups = allGroups.filter(g => g.category === category)
    }

    // Filter by location
    if (location) {
      allGroups = allGroups.filter(g =>
        g.location_focus?.toLowerCase().includes((location as string).toLowerCase())
      )
    }

    // Search
    if (search) {
      const searchLower = (search as string).toLowerCase()
      allGroups = allGroups.filter(g =>
        g.name.toLowerCase().includes(searchLower) ||
        g.description?.toLowerCase().includes(searchLower)
      )
    }

    // Sort by member count
    allGroups.sort((a, b) => b.member_count - a.member_count)

    const start = (Number(page) - 1) * Number(limit)
    const paginatedGroups = allGroups.slice(start, start + Number(limit))

    res.json({
      success: true,
      groups: paginatedGroups,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: allGroups.length,
        hasMore: start + Number(limit) < allGroups.length
      },
      categories: ['Regional', 'Interest', 'Wellness', 'Professional', 'Social']
    })
  } catch (error) {
    console.error('[Groups] List error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch groups' })
  }
})

/**
 * GET /api/groups/:groupId
 * Get group details
 */
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params

    // Try to find by ID or slug
    let group = groups.get(groupId)
    if (!group) {
      group = Array.from(groups.values()).find(g => g.slug === groupId)
    }

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      })
    }

    // Get recent events (mock)
    const recentEvents = [
      {
        id: 'evt_1',
        name: 'Monthly Meetup',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    res.json({
      success: true,
      group: {
        ...group,
        recentEvents,
        admins: [
          { id: 'admin_1', name: 'Group Admin', role: 'owner' }
        ]
      }
    })
  } catch (error) {
    console.error('[Groups] Get error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch group' })
  }
})

/**
 * POST /api/groups
 * Create a new group
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, visibility, joinPolicy, category, locationFocus, createdBy } = req.body

    if (!name || !createdBy) {
      return res.status(400).json({
        success: false,
        error: 'Name and creator are required'
      })
    }

    // Generate slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug exists
    const existingSlug = Array.from(groups.values()).find(g => g.slug === slug)
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        error: 'A group with a similar name already exists'
      })
    }

    const group = {
      id: `grp_${Date.now()}`,
      name,
      slug,
      description: description || null,
      visibility: visibility || 'public',
      join_policy: joinPolicy || 'open',
      category: category || 'Social',
      location_focus: locationFocus || 'UK-wide',
      member_count: 1,
      event_count: 0,
      liberation_aligned: true,
      created_by: createdBy,
      created_at: new Date().toISOString()
    }

    groups.set(group.id, group)

    // Add creator as owner
    const membership = {
      id: `mem_${Date.now()}`,
      group_id: group.id,
      user_id: createdBy,
      role: 'owner',
      status: 'active',
      joined_at: new Date().toISOString()
    }

    memberships.set(group.id, [membership])

    console.log(`🏴 [Groups] Created: ${name}`)

    res.json({
      success: true,
      message: 'Group created',
      group
    })
  } catch (error) {
    console.error('[Groups] Create error:', error)
    res.status(500).json({ success: false, error: 'Failed to create group' })
  }
})

/**
 * PUT /api/groups/:groupId
 * Update group settings
 */
router.put('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params
    const updates = req.body

    const group = groups.get(groupId)
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      })
    }

    const updatedGroup = {
      ...group,
      ...updates,
      updated_at: new Date().toISOString()
    }

    groups.set(groupId, updatedGroup)

    console.log(`📝 [Groups] Updated: ${group.name}`)

    res.json({
      success: true,
      message: 'Group updated',
      group: updatedGroup
    })
  } catch (error) {
    console.error('[Groups] Update error:', error)
    res.status(500).json({ success: false, error: 'Failed to update group' })
  }
})

// ============================================
// Membership Endpoints
// ============================================

/**
 * POST /api/groups/:groupId/join
 * Join a group
 */
router.post('/:groupId/join', async (req, res) => {
  try {
    const { groupId } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      })
    }

    const group = groups.get(groupId)
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      })
    }

    // Check if already a member
    const groupMemberships = memberships.get(groupId) || []
    const existingMembership = groupMemberships.find(m => m.user_id === userId)

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        error: 'Already a member of this group'
      })
    }

    const status = group.join_policy === 'open' ? 'active' : 'pending'

    const membership = {
      id: `mem_${Date.now()}`,
      group_id: groupId,
      user_id: userId,
      role: 'member',
      status,
      joined_at: new Date().toISOString()
    }

    groupMemberships.push(membership)
    memberships.set(groupId, groupMemberships)

    // Update member count
    if (status === 'active') {
      group.member_count = (group.member_count || 0) + 1
      groups.set(groupId, group)
    }

    console.log(`👥 [Groups] ${status === 'active' ? 'Joined' : 'Requested'}: ${userId} -> ${group.name}`)

    res.json({
      success: true,
      message: status === 'active' ? 'Joined group' : 'Join request submitted',
      membership
    })
  } catch (error) {
    console.error('[Groups] Join error:', error)
    res.status(500).json({ success: false, error: 'Failed to join group' })
  }
})

/**
 * DELETE /api/groups/:groupId/leave
 * Leave a group
 */
router.delete('/:groupId/leave', async (req, res) => {
  try {
    const { groupId } = req.params
    const { userId } = req.body

    const group = groups.get(groupId)
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      })
    }

    const groupMemberships = memberships.get(groupId) || []
    const membershipIndex = groupMemberships.findIndex(m => m.user_id === userId)

    if (membershipIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'Not a member of this group'
      })
    }

    const membership = groupMemberships[membershipIndex]

    // Don't allow owner to leave
    if (membership.role === 'owner') {
      return res.status(400).json({
        success: false,
        error: 'Group owner cannot leave. Transfer ownership first.'
      })
    }

    groupMemberships.splice(membershipIndex, 1)
    memberships.set(groupId, groupMemberships)

    // Update member count
    if (membership.status === 'active') {
      group.member_count = Math.max(0, (group.member_count || 1) - 1)
      groups.set(groupId, group)
    }

    console.log(`👋 [Groups] Left: ${userId} <- ${group.name}`)

    res.json({
      success: true,
      message: 'Left group'
    })
  } catch (error) {
    console.error('[Groups] Leave error:', error)
    res.status(500).json({ success: false, error: 'Failed to leave group' })
  }
})

/**
 * GET /api/groups/:groupId/members
 * Get group members
 */
router.get('/:groupId/members', async (req, res) => {
  try {
    const { groupId } = req.params
    const { status = 'active', page = 1, limit = 50 } = req.query

    const groupMemberships = (memberships.get(groupId) || [])
      .filter(m => m.status === status)

    const start = (Number(page) - 1) * Number(limit)
    const paginatedMembers = groupMemberships.slice(start, start + Number(limit))

    res.json({
      success: true,
      members: paginatedMembers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: groupMemberships.length,
        hasMore: start + Number(limit) < groupMemberships.length
      }
    })
  } catch (error) {
    console.error('[Groups] Members error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch members' })
  }
})

/**
 * GET /api/groups/user/:userId
 * Get groups a user belongs to
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const userGroups: any[] = []

    memberships.forEach((groupMembers, groupId) => {
      const membership = groupMembers.find(m => m.user_id === userId && m.status === 'active')
      if (membership) {
        const group = groups.get(groupId)
        if (group) {
          userGroups.push({
            ...group,
            membership: {
              role: membership.role,
              joined_at: membership.joined_at
            }
          })
        }
      }
    })

    res.json({
      success: true,
      groups: userGroups
    })
  } catch (error) {
    console.error('[Groups] User groups error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch user groups' })
  }
})

/**
 * PUT /api/groups/:groupId/members/:userId
 * Update member role/status (admin only)
 */
router.put('/:groupId/members/:userId', async (req, res) => {
  try {
    const { groupId, userId } = req.params
    const { role, status } = req.body

    const groupMemberships = memberships.get(groupId) || []
    const membershipIndex = groupMemberships.findIndex(m => m.user_id === userId)

    if (membershipIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      })
    }

    if (role) {
      groupMemberships[membershipIndex].role = role
    }

    if (status) {
      const previousStatus = groupMemberships[membershipIndex].status
      groupMemberships[membershipIndex].status = status

      // Update member count if status changed
      const group = groups.get(groupId)
      if (group) {
        if (previousStatus !== 'active' && status === 'active') {
          group.member_count = (group.member_count || 0) + 1
        } else if (previousStatus === 'active' && status !== 'active') {
          group.member_count = Math.max(0, (group.member_count || 1) - 1)
        }
        groups.set(groupId, group)
      }
    }

    memberships.set(groupId, groupMemberships)

    console.log(`👥 [Groups] Member updated: ${userId} in ${groupId}`)

    res.json({
      success: true,
      message: 'Member updated',
      membership: groupMemberships[membershipIndex]
    })
  } catch (error) {
    console.error('[Groups] Update member error:', error)
    res.status(500).json({ success: false, error: 'Failed to update member' })
  }
})

export default router
