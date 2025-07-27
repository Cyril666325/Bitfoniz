"use client";

import { motion } from "framer-motion";
import FeatureCard from "./FeatureCard";

const Features = () => {
  return (
    <section id="features" className="padding-x max-container overflow-hidden">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-[24px] md:text-[55.31px] font-primary font-medium mb-10 text-center"
        >
          Why Choose BITFONIZ?
        </motion.h1>
        <FeatureCard />
      </div>
    </section>
  );
};

export default Features;
