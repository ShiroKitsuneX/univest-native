import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/firebase/config";
import { GEO_DATA } from "@/data/geo";
import { logger } from "@/services/logger";

export const seedGeoData = async () => {
  try {
    const countriesSnap = await getDocs(collection(db, "countries"));
    if (!countriesSnap.empty) return;

    const batch = writeBatch(db);

    GEO_DATA.countries.forEach(c => {
      batch.set(doc(db, "countries", c.id), c);
    });

    GEO_DATA.states.forEach(s => {
      batch.set(doc(db, "states", s.id), s);
    });

    GEO_DATA.cities.forEach(c => {
      batch.set(doc(db, "cities", c.id), c);
    });

    await batch.commit();
    logger.warn("Geo data seeded successfully!");
  } catch (e) {
    logger.warn("Error seeding geo data:", e.message);
  }
};

export const fetchGeoCollections = async () => {
  const [countriesSnap, statesSnap, citiesSnap] = await Promise.all([
    getDocs(collection(db, "countries")),
    getDocs(collection(db, "states")),
    getDocs(collection(db, "cities")),
  ]);
  return {
    countries: countriesSnap.empty ? [] : countriesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    states: statesSnap.empty ? [] : statesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    cities: citiesSnap.empty ? [] : citiesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
  };
};
