"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function ClayBackground() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 320]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -420]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const y5 = useTransform(scrollYProgress, [0, 1], [0, -260]);
  const r1 = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const r2 = useTransform(scrollYProgress, [0, 1], [0, -180]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        style={{ y: y1, rotate: r1 }}
        className="absolute -top-20 -left-16 w-44 h-44 sm:w-72 sm:h-72 clay-blob alt opacity-70 animate-floatSlow"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-[30%] -right-24 w-56 h-56 sm:w-96 sm:h-96 clay-blob opacity-50 animate-float"
      />
      <motion.div
        style={{ y: y3, rotate: r2 }}
        className="absolute top-[80%] left-[10%] w-36 h-36 sm:w-60 sm:h-60 clay-blob cube alt opacity-60 animate-floatSlow"
      />
      <motion.div
        style={{ y: y4 }}
        className="absolute top-[160%] -right-16 w-48 h-48 sm:w-80 sm:h-80 clay-blob opacity-40 animate-float"
      />
      <motion.div
        style={{ y: y5, rotate: r1 }}
        className="absolute top-[230%] left-[5%] w-44 h-44 sm:w-72 sm:h-72 clay-blob alt opacity-50 animate-floatSlow"
      />

      {/* tiny floaty orbs */}
      <motion.div
        style={{ y: y2 }}
        className="absolute top-[15%] left-[40%] w-7 h-7 sm:w-10 sm:h-10 clay-blob pill opacity-90"
      />
      <motion.div
        style={{ y: y1 }}
        className="absolute top-[55%] left-[55%] w-10 h-10 sm:w-14 sm:h-14 clay-blob alt cube opacity-80"
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute top-[120%] left-[70%] w-8 h-8 sm:w-12 sm:h-12 clay-blob pill opacity-80"
      />
    </div>
  );
}
