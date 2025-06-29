"use client";

import Image from "next/image";

// import { useState } from "react";
import { motion } from "framer-motion";
// import { GlowEffect } from "@/components/ui/glow-effect";

import styles from "./page.module.css";

export default function EventCard({
  event,
  index,
}: {
  event: any;
  index: number;
}) {
//   const [isGlowVisible, setIsGlowVisible] = useState(false);

  return (
    <motion.div
      className={styles.eventCardContainer}
      key={index}
      initial={{ scale: 0.98 }}
      whileHover={{ scale: 1 }}  
      transition={{
        duration: 0.05,
      }}
      // style={event.style}
    >
      {/* <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isGlowVisible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
          ease: "easeOut",
        }}
      >
        <GlowEffect
          colors={["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]}
          mode="colorShift"
          blur="medium"
          duration={4}
        />
      </motion.div> */}
      <div
        className={styles.eventCard}
        // onMouseEnter={() => setIsGlowVisible(true)}
        // onMouseLeave={() => setIsGlowVisible(false)}
      >
        <Image src={event.imageUrl} alt={event.title} fill />
        <div className={styles.gradientOverlay}></div>
        <div className={styles.cardContent}>
          <h3>{event.title}</h3>
          <p>{event.date}</p>
        </div>
      </div>
    </motion.div>
  );
}
