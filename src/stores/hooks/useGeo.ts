import { useMemo } from 'react'
import { GEO_DATA } from '@/data/geo'
import {
  useGeoStore,
  type Country,
  type GeoState_State,
  type City,
} from '@/stores/geoStore'

export type GeoLookups = {
  countries: Country[]
  states: GeoState_State[]
  cities: City[]
  getCountry: (id: string) => Country | undefined
  getState: (id: string) => GeoState_State | undefined
  getCity: (id: string) => City | undefined
  getStatesForCountry: (cid: string) => GeoState_State[]
  getCitiesForState: (sid: string) => City[]
  getCountryName: (id: string) => string
  getStateName: (id: string) => string
  getCityName: (id: string) => string
}

// Reactive geo lookups. Subscribes to the underlying arrays in the store so
// components re-render when remote geo data finishes loading. The store also
// exposes selector methods (`get().getCity(id)`), but those use `get()` and
// don't subscribe — use this hook in render code, use the store directly only
// in store-to-store wiring.
export function useGeo(): GeoLookups {
  const countries = useGeoStore(s => s.countries)
  const states = useGeoStore(s => s.states)
  const cities = useGeoStore(s => s.cities)

  return useMemo<GeoLookups>(() => {
    const getCountry = (id: string) =>
      countries.find(c => c.id === id) ||
      GEO_DATA.countries.find(c => c.id === id)
    const getState = (id: string) =>
      states.find(s => s.id === id) || GEO_DATA.states.find(s => s.id === id)
    const getCity = (id: string) =>
      cities.find(c => c.id === id) || GEO_DATA.cities.find(c => c.id === id)
    const getStatesForCountry = (cid: string) => {
      const fromDb = states.filter(s => s.countryId === cid)
      return fromDb.length > 0
        ? fromDb
        : GEO_DATA.states.filter(s => s.countryId === cid)
    }
    const getCitiesForState = (sid: string) => {
      const fromDb = cities.filter(c => c.stateId === sid)
      return fromDb.length > 0
        ? fromDb
        : GEO_DATA.cities.filter(c => c.stateId === sid)
    }
    return {
      countries,
      states,
      cities,
      getCountry,
      getState,
      getCity,
      getStatesForCountry,
      getCitiesForState,
      getCountryName: id => getCountry(id)?.name || '',
      getStateName: id => getState(id)?.name || '',
      getCityName: id => getCity(id)?.name || '',
    }
  }, [countries, states, cities])
}
