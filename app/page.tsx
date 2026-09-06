import { Navbar } from "@/src/components/landing/Navbar";
import { HeroSection } from "@/src/components/landing/HeroSection";
import { CatalogExperience } from "@/src/components/landing/CatalogExperience";
import { FooterSimple } from "@/src/components/landing/FooterSimple";

export default function Home() {
  return <div className="flex min-h-screen flex-col bg-[#130d09]"><Navbar /><main className="flex flex-1 flex-col"><HeroSection /><CatalogExperience /></main><FooterSimple /></div>;
}
