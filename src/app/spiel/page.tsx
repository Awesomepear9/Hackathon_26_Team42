import type { Metadata } from "next";
import { Game } from "@/components/dungeon/game";

export const metadata: Metadata = {
  title: "Spiel",
  description: "Fahr durch die Pixel-Stadt und meistere Verkehrssituationen aus dem Fragenkatalog.",
};

export default function SpielPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <Game />
    </div>
  );
}
