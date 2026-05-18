import { createContext, useContext, useState } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [open, setOpen] = useState(false);
  return <SettingsContext.Provider value={{ open, setOpen }}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
