// Verknüpfung zur DigiFL-Website mit dem Theorie-Dungeon. Die App wird normalerweise von der Website
// unter /apps/praxismodul/ ausgeliefert, daher reicht standardmäßig der Pfad "/".
const base = (import.meta.env.VITE_WEBSITE_URL ?? '/').replace(/\/?$/, '/')

export const WEBSITE_URL = base
export const DUNGEON_URL = `${base}spiel`
