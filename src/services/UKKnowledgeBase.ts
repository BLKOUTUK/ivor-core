/**
 * UK Knowledge Base for Black Queer Community Resources
 *
 * MODULARIZED: This file now re-exports from the modular knowledge base structure.
 *
 * The knowledge base has been split into regional modules:
 * - 9 English regions (ONS classification): London, South East, South West,
 *   East of England, East Midlands, West Midlands, North West, North East, Yorkshire
 * - 3 Devolved nations: Scotland, Wales, Northern Ireland
 * - Nationwide UK-wide resources
 *
 * For direct regional access, import from './knowledge/index.js'
 *
 * @see ./knowledge/index.ts - Main aggregator
 * @see ./knowledge/types.ts - Type definitions
 * @see ./knowledge/base.ts - Base provider class
 * @see ./knowledge/regions/ - English regional modules
 * @see ./knowledge/nations/ - Devolved nation modules
 * @see ./knowledge/national/ - UK-wide resources
 */

// Re-export everything from the modular knowledge base
export {
  UKKnowledgeBase,
  UKResource,
  KnowledgeEntry,
  JourneyStage,
  UKLocation,
  UKRegion,
  cityToRegion,
  RegionalResourceProvider,
  // Individual providers for direct access
  nationwideProvider,
  londonProvider,
  northWestProvider,
  westMidlandsProvider,
  yorkshireProvider,
  southEastProvider,
  southWestProvider,
  eastEnglandProvider,
  eastMidlandsProvider,
  northEastProvider,
  scotlandProvider,
  walesProvider,
  northernIrelandProvider
} from './knowledge/index.js'

// Default export
export { default } from './knowledge/index.js'
