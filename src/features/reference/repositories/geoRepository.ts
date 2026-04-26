import {
  collection,
  doc,
  getDocs,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/core/firebase/client'
import { firestorePaths, getPath } from '@/core/firebase/firestorePaths'
import { GEO_DATA } from '@/data/geo'
import { logger } from '@/services/logger'

type GeoDoc = { id: string } & DocumentData

export type GeoCollections = {
  countries: GeoDoc[]
  states: GeoDoc[]
  cities: GeoDoc[]
}

export const seedGeoData = async (): Promise<void> => {
  try {
    const countriesSnap = await getDocs(
      collection(db, getPath(...firestorePaths.countries()))
    )
    if (!countriesSnap.empty) return

    const batch = writeBatch(db)

    GEO_DATA.countries.forEach((c: { id: string }) => {
      batch.set(doc(db, getPath(...firestorePaths.country(c.id))), c)
    })
    GEO_DATA.states.forEach((s: { id: string }) => {
      batch.set(doc(db, getPath(...firestorePaths.state(s.id))), s)
    })
    GEO_DATA.cities.forEach((c: { id: string }) => {
      batch.set(doc(db, getPath(...firestorePaths.city(c.id))), c)
    })

    await batch.commit()
  } catch (e: unknown) {
    logger.warn('seedGeoData:', (e as Error)?.message)
  }
}

export const fetchGeoCollections = async (): Promise<GeoCollections> => {
  const [countriesSnap, statesSnap, citiesSnap] = await Promise.all([
    getDocs(collection(db, getPath(...firestorePaths.countries()))),
    getDocs(collection(db, getPath(...firestorePaths.states()))),
    getDocs(collection(db, getPath(...firestorePaths.cities()))),
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
