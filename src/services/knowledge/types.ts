/**
 * Extended Types for Regional UK Knowledge Base
 * Supporting granular location-based resource organization
 */

import { UKResource, KnowledgeEntry, JourneyStage, UKLocation } from '../../types/journey.js'

// English Regions (ONS classification)
export type EnglishRegion =
  | 'london'
  | 'south_east'      // Brighton, Canterbury, Southampton
  | 'south_west'      // Bristol, Bath, Exeter, Plymouth
  | 'east_england'    // Cambridge, Norwich, Ipswich
  | 'east_midlands'   // Nottingham, Leicester, Derby
  | 'west_midlands'   // Birmingham, Coventry, Wolverhampton
  | 'north_west'      // Manchester, Liverpool, Preston
  | 'north_east'      // Newcastle, Sunderland, Durham
  | 'yorkshire'       // Leeds, Sheffield, York, Bradford

// Devolved Nations
export type DevolvedNation =
  | 'scotland'        // Glasgow, Edinburgh, Aberdeen
  | 'wales'           // Cardiff, Swansea, Newport
  | 'northern_ireland' // Belfast, Derry

// Combined UK Region
export type UKRegion = EnglishRegion | DevolvedNation | 'nationwide'

// Map cities to regions
export const cityToRegion: Record<UKLocation, UKRegion> = {
  london: 'london',
  manchester: 'north_west',
  birmingham: 'west_midlands',
  leeds: 'yorkshire',
  sheffield: 'yorkshire',
  nottingham: 'east_midlands',
  liverpool: 'north_west',
  bristol: 'south_west',
  brighton: 'south_east',
  glasgow: 'scotland',
  cardiff: 'wales',
  belfast: 'northern_ireland',
  other_urban: 'nationwide',
  rural: 'nationwide',
  unknown: 'nationwide'
}

// Region display names
export const regionDisplayNames: Record<UKRegion, string> = {
  london: 'London',
  south_east: 'South East England',
  south_west: 'South West England',
  east_england: 'East of England',
  east_midlands: 'East Midlands',
  west_midlands: 'West Midlands',
  north_west: 'North West England',
  north_east: 'North East England',
  yorkshire: 'Yorkshire and the Humber',
  scotland: 'Scotland',
  wales: 'Wales',
  northern_ireland: 'Northern Ireland',
  nationwide: 'UK-wide'
}

// Regional resource provider
export interface RegionalResourceProvider {
  region: UKRegion
  getResources(): UKResource[]
  getKnowledgeEntries(): KnowledgeEntry[]
}

// Region metadata
export interface RegionMetadata {
  region: UKRegion
  displayName: string
  majorCities: UKLocation[]
  population?: number
  notes?: string
}

// All English regions
export const englishRegions: EnglishRegion[] = [
  'london',
  'south_east',
  'south_west',
  'east_england',
  'east_midlands',
  'west_midlands',
  'north_west',
  'north_east',
  'yorkshire'
]

// All devolved nations
export const devolvedNations: DevolvedNation[] = [
  'scotland',
  'wales',
  'northern_ireland'
]

// All regions
export const allRegions: UKRegion[] = [
  ...englishRegions,
  ...devolvedNations,
  'nationwide'
]

export { UKResource, KnowledgeEntry, JourneyStage, UKLocation }
