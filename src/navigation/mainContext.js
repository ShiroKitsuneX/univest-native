import { createContext, useContext } from 'react'

export const MainCtx = createContext(null)
export const useMain = () => useContext(MainCtx)
