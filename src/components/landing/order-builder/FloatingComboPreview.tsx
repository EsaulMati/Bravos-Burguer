"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ComboAddon, ProductItem } from "@/src/types/landing";

interface Props { burger: ProductItem; burgerQuantity: number; friesAddon?: ComboAddon; friesEnabled: boolean; friesQuantity: number; drinkAddon?: ComboAddon; drinkEnabled: boolean; drinkQuantity: number }
const transition = { duration: .22, ease: "easeOut" as const };

export function FloatingComboPreview({ burger, burgerQuantity, friesAddon, friesEnabled, friesQuantity, drinkAddon, drinkEnabled, drinkQuantity }: Props) {
  const reduce = useReducedMotion();
  const enter = reduce ? false : { opacity: 0, scale: .96, y: 10 };
  const exit = reduce ? { opacity: 0 } : { opacity: 0, scale: .97, y: 8 };
  return (
    <div className="builder-product-stage relative min-h-[22rem] sm:min-h-[28rem] lg:min-h-[31rem]" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div key={burger.id} initial={enter} animate={{ opacity: 1, scale: 1, y: 0 }} exit={exit} transition={transition} className={`builder-burger absolute z-20 ${burger.id === "brava-doble" ? "builder-burger--leon" : "builder-burger--gordita"}`}>
          <Image src={burger.cutoutImage ?? burger.image} alt={burger.name} fill sizes="(max-width: 1024px) 65vw, 34vw" className="object-contain drop-shadow-[0_25px_18px_rgba(22,8,2,.55)]" />
          {burgerQuantity > 1 && <QuantityBadge value={burgerQuantity} />}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {friesEnabled && friesAddon?.cutoutImage && <motion.div key="fries" initial={enter} animate={{ opacity: 1, scale: 1, y: 0 }} exit={exit} transition={transition} className="builder-fries absolute z-30"><Image src={friesAddon.cutoutImage} alt={friesAddon.name} fill sizes="(max-width: 1024px) 48vw, 24vw" className="object-contain drop-shadow-[0_22px_16px_rgba(22,8,2,.5)]" />{friesQuantity > 1 && <QuantityBadge value={friesQuantity} />}</motion.div>}
      </AnimatePresence>
      <AnimatePresence>
        {drinkEnabled && drinkAddon?.cutoutImage && <motion.div key="drink" initial={enter} animate={{ opacity: 1, scale: 1, y: 0 }} exit={exit} transition={transition} className="builder-drink absolute z-10"><Image src={drinkAddon.cutoutImage} alt={drinkAddon.name} fill sizes="(max-width: 1024px) 48vw, 24vw" className="object-contain drop-shadow-[0_22px_16px_rgba(22,8,2,.5)]" />{drinkQuantity > 1 && <QuantityBadge value={drinkQuantity} />}</motion.div>}
      </AnimatePresence>
    </div>
  );
}

function QuantityBadge({ value }: { value: number }) {
  return <span className="absolute bottom-2 right-2 rounded-full bg-[#24150d]/90 px-2.5 py-1 font-dosis text-xs font-bold text-[#ffe8c0]">×{value}</span>;
}
