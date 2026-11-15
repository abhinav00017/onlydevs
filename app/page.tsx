import type { Metadata } from "next";
import {
  EndFrame,
  FaqFrame,
  FixFrame,
  FoundersFrame,
  HeroFrame,
  HowFrame,
  KitFrame,
  PainFrame,
  ProductsFrame,
  ProofFrame,
  WhoFrame,
} from "@/components/home/frames";
import { StressFree } from "@/components/home/StressFree";
import { META } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: META.home.title },
  description: META.home.description,
  alternates: { canonical: "/" },
};

/** The home page, frames 1 to 12 of docs/storyboard.html. */
export default function Home() {
  return (
    <>
      <HeroFrame />
      <ProofFrame />
      <PainFrame />
      <FixFrame />
      <StressFree />
      <WhoFrame />
      <ProductsFrame />
      <KitFrame />
      <HowFrame />
      <FoundersFrame />
      <FaqFrame />
      <EndFrame />
    </>
  );
}
