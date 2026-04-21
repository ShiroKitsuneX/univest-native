import { create } from 'zustand'
import { GEO_DATA } from '@/data/geo'
import { seedGeoData, fetchGeoCollections } from '@/services/geo'
import { logger } from '@/services/logger'

export type Country = { id: string; name: string }
export type GeoState_State = { id: string; name: string; countryId: string }
export type City = { id: string; name: string; stateId: string }

type GeoState = {
  countries: Country[]
  states: GeoState_State[]
  cities: City[]
  loaded: boolean

  load: () => Promise<void>
  getCountry: (id: string) => Country | undefined
  getState: (id: string) => GeoState_State | undefined
  getCity: (id: string) => City | undefined
  getStatesForCountry: (cid: string) => GeoState_State[]
  getCitiesForState: (sid: string) => City[]
}

export const useGeoStore = create<GeoState>((set, get) => ({
  countries: [],
  states: [],
  cities: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return
    try {
      await seedGeoData()
      const { countries, states, cities } = await fetchGeoCollections()
      set({
        countries: (countries.length ? countries : []) as Country[],
        states: (states.length ? states : []) as GeoState_State[],
        cities: (cities.length ? cities : []) as City[],
        loaded: true,
      })
    } catch (e: unknown) {
      logger.warn('Error loading geo data:', (e as Error)?.message)
      set({ loaded: true })
    }
  },

  getCountry: id => {
    const { countries } = get()
    return (
      countries.find(c => c.id === id) ||
      GEO_DATA.countries.find(c => c.id === id)
    )
  },
  getState: id => {
    const { states } = get()
    return (
      states.find(s => s.id === id) || GEO_DATA.states.find(s => s.id === id)
    )
  },
  getCity: id => {
    const { cities } = get()
    return (
      cities.find(c => c.id === id) || GEO_DATA.cities.find(c => c.id === id)
    )
  },
  getStatesForCountry: cid => {
    const { states } = get()
    const fromDb = states.filter(s => s.countryId === cid)
    return fromDb.length > 0
      ? fromDb
      : GEO_DATA.states.filter(s => s.countryId === cid)
  },
  getCitiesForState: sid => {
    const { cities } = get()
    const fromDb = cities.filter(c => c.stateId === sid)
    return fromDb.length > 0
      ? fromDb
      : GEO_DATA.cities.filter(c => c.stateId === sid)
  },
}))
