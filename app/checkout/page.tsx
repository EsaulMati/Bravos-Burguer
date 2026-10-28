import type { Metadata } from "next";
import { FooterSimple } from "@/src/components/landing/FooterSimple";
import { Navbar } from "@/src/components/landing/Navbar";
import { CheckoutExperience } from "@/src/components/landing/checkout/CheckoutExperience";

export const metadata: Metadata = { title: "Tu pedido", description: "Revisa tu pedido Bravos y envíalo por WhatsApp.", robots: { index: false, follow: true } };

export default function CheckoutPage() {
  return <div className="flex min-h-screen flex-col bg-[#16110E]"><Navbar /><main className="flex-1"><CheckoutExperience /></main><FooterSimple /></div>;
}
