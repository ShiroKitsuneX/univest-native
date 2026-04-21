import {
  collection,
  doc,
  getDocs,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { GEO_DATA } from '@/data/geo'
import { logger } from '@/services/logger'

type GeoDoc = { id: string } & DocumentData

type GeoCollections = {
  countries: GeoDoc[]
  states: GeoDoc[]
  cities: GeoDoc[]
}

export const seedGeoData = async (): Promise<void> => {
  try {
    const countriesSnap = await getDocs(collection(db, 'countries'))
    if (!countriesSnap.empty) return

    const batch = writeBatch(db)

    GEO_DATA.countries.forEach((c: { id: string }) => {
      batch.set(doc(db, 'countries', c.id), c)
    })

    GEO_DATA.states.forEach((s: { id: string }) => {
      batch.set(doc(db, 'states', s.id), s)
    })

    GEO_DATA.cities.forEach((c: { id: string }) => {
      batch.set(doc(db, 'cities', c.id), c)
    })

    await batch.commit()
    logger.warn('Geo data seeded successfully!')
  } catch (e: unknown) {
    logger.warn('Error seeding geo data:', (e as Error)?.message)
  }
}

export const fetchGeoCollections = async (): Promise<GeoCollections> => {
  const [countriesSnap, statesSnap, citiesSnap] = await Promise.all([
    getDocs(collection(db, 'countries')),
    getDocs(collection(db, 'states')),
    getDocs(collection(db, 'cities')),
  ])
  return {
    countries: countriesSnap.empty
      ? []
      : countriesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    states: statesSnap.empty
      ? []
      : statesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    cities: citiesSnap.empty
      ? []
      : citiesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
  }
}
