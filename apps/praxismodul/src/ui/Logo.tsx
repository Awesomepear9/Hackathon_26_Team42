// Einzige Logo-Datei: public/digifl-logo.svg (aus digi_fl.svg, obere Variante mit dunkler Straße).
// Benannte Ausschnitte derselben Datei: #icon (Bildmarke), #logo (hell), #logo-dark (helles „FL“,
// weil das Dunkelblau auf dunklem Grund kaum lesbar ist).
const LOGO_URL = `${import.meta.env.BASE_URL}digifl-logo.svg`

/** DigiFL-Icon: Straße mit Standort-Pin */
export function Logo({ className = 'size-10' }: { className?: string }) {
  return <img src={`${LOGO_URL}#icon`} alt="DigiFL" className={`object-contain ${className}`} />
}

/** Icon mit Schriftzug „DigiFL“ */
export function LogoWordmark({ className = 'h-12' }: { className?: string }) {
  return (
    <>
      <img src={`${LOGO_URL}#logo`} alt="DigiFL" className={`w-auto dark:hidden ${className}`} />
      <img src={`${LOGO_URL}#logo-dark`} alt="DigiFL" className={`hidden w-auto dark:block ${className}`} />
    </>
  )
}
