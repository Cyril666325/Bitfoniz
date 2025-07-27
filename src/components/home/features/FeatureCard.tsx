"use client";

import { MoveUpRight } from "lucide-react";
import { motion, Variants, cubicBezier } from "framer-motion";

const cards = [
  {
    feature: "🧠 Code-Automated Trading",
    title: "Admin-distributed trade signals",
    desc: "Execute with precision or simulate strategies.",
  },
  {
    feature: "🔐 Centralized Wallet, Simplified Control",
    title: "One wallet to rule all",
    desc: "users deposit, admins trade, everyone earns.",
  },
  {
    feature: "🌐 Referral Ecosystem",
    title: "Earn passively with tiered referrals",
    desc: "Real-time tracking. Instant stats.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: cubicBezier(0.16, 1, 0.3, 1),
    },
  },
};

const FeatureCard = () => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {cards.map((item, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(58, 235, 165, 0.1)",
          }}
          className="bg-[#121312] h-[375px] rounded-[16px] flex flex-col justify-between px-4 pt-4 pb-10 inner-shadow relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#3AEBA5] to-transparent opacity-0 group-hover:opacity-5 transition-opacity"
            initial={false}
            animate={{
              x: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 8,
              ease: "linear",
              repeat: Infinity,
            }}
          />

          <div className="flex items-center justify-between w-full relative z-10">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 * index }}
              viewport={{ once: true }}
              className="font-medium text-[8.46px] md:text-[13.67px] text-[#A1A3A7] uppercase"
            >
              {item.feature}
            </motion.span>
            <motion.div
              whileHover={{ rotate: 45 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MoveUpRight size={9.9} className="md:text-[16px]" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 * index }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 max-w-[425.23px] w-full relative z-10"
          >
            <h1 className="text-[18.48px] md:text-[29.88px] font-medium">
              {item.title}
            </h1>
            <p className="text-[11.41px] md:text-[18.44px] font-light">
              {item.desc}
            </p>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default FeatureCard;
