"use client";

import { CircleDollarSign, Hash, Plus, UserCircle } from "lucide-react";
import { motion, easeOut } from "framer-motion";

const steps = [
  {
    icon: <UserCircle />,
    step: "Sign Up Securely",
  },
  {
    icon: <Plus />,
    step: "Deposit into your wallet",
  },
  {
    icon: <Hash />,
    step: "Receive order codes",
  },
  {
    icon: <CircleDollarSign />,
    step: "Execute, Earn & Refer",
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeOut,
    },
  },
};

const HowItWorks = () => {
  return (
    <motion.div
      id="how-it-works"
      className="max-container padding-x py-[8rem] flex items-center flex-col justify-center overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <motion.h1
        className="font-medium font-primary text-[24px] md:text-[55.31px] max-w-[915px] w-full text-center"
        variants={itemVariants}
      >
        How BITFONIZ Works in 3 Simple Steps
      </motion.h1>
      <motion.div
        className="rounded-[12px] min-h-[79px] h-full grid-cols-1 grid md:grid-cols-4 md:divide-x divide-y divide-[#303033] mt-10 border border-[#303033] w-full md:w-auto relative overflow-hidden"
        variants={itemVariants}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#3AEBA5] to-transparent opacity-5"
          animate={{
            x: ["0%", "100%", "0%"],
          }}
          transition={{
            duration: 8,
            ease: "linear",
            repeat: Infinity,
          }}
        />
        {steps.map((item, index) => (
          <motion.div
            className="flex items-center px-8 py-4 md:py-0 gap-3 relative hover:bg-[#ffffff05] transition-colors"
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.span
              className="text-[24px] text-[#3AEBA5]"
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {item.icon}
            </motion.span>
            <p className="text-lg font-poppins text-[19px] md:text-[20px]">
              {item.step}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default HowItWorks;
