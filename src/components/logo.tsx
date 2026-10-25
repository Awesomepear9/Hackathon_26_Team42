// Einzige Logo-Datei: public/digifl-logo.svg. Hell und dunkel sind benannte Ausschnitte (#logo,
// #logo-dark) derselben Datei; die passende Variante folgt der .dark-Klasse.
// <img> statt next/image, weil die Ausschnitte über das URL-Fragment gewählt werden.
/* eslint-disable @next/next/no-img-element */

export const LOGO_SRC = "/digifl-logo.svg";

export function Logo({ className = "h-8", alt = "DigiFL" }: { className?: string; alt?: string }) {
  return (
    <>
      <img src={`${LOGO_SRC}#logo`} alt={alt} width={377} height={119} className={`w-auto dark:hidden ${className}`} />
      <img src={`${LOGO_SRC}#logo-dark`} alt={alt} width={377} height={119} className={`hidden w-auto dark:block ${className}`} />
    </>
  );
}
