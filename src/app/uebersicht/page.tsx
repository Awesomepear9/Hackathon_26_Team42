import type { Metadata } from "next";
import { Overview } from "@/components/dungeon/overview";

export const metadata: Metadata = {
  title: "Übersicht",
  description: "Lernstand, Runs und Fortschritt im Fragenkatalog des DigiFL Theorie-Dungeons.",
};

export default function UebersichtPage() {
  return <Overview />;
}
