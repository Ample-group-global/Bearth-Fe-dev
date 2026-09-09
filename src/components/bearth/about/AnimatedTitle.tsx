"use client";
import { motion } from "motion/react";

export default function AnimatedTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, translateY: "90px" }}
      whileInView={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.7 }}
    >
      {children}
    </motion.div>
  );
}
