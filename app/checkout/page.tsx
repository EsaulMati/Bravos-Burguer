import type { Metadata } from "next";
import { FooterSimple } from "@/src/components/landing/FooterSimple";
import { Navbar } from "@/src/components/landing/Navbar";
import { CheckoutExperience } from "@/src/components/landing/checkout/CheckoutExperience";

export const metadata: Metadata = { title: "Checkout | Bravos Burger", description: "Revisa y confirma tu pedido Bravos." };

export default function CheckoutPage() {
  return <div className="flex min-h-screen flex-col bg-[#130d09]"><Navbar /><main className="flex-1"><CheckoutExperience /></main><FooterSimple /></div>;
}
