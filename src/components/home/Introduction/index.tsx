"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const Introduction = () => {
  return (
    <section
      id="introduction"
      className="max-container w-full mx-auto grid grid-cols-1 md:grid-cols-2 pt-[25rem] gap-10 items-center px-6 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="w-full"
      >
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-[#A1A3A70D] uppercase h-[36px] w-[216px] text-[13.56px] font-medium text-[#A1A3A7] border-[0.5px] border-[#A1A3A726] rounded-full mb-4 hover:bg-[#A1A3A71A] transition-colors"
        >
          Introducing BITFONIZ
        </motion.button>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-[15.99px] lg:text-[30px] text-white italic lg:w-[498.47px]"
        >
          A secure, referral-driven, code-automated trading platform designed to
          empower both everyday traders and advanced users with precise
          execution, centralized fund management, and dynamic income streams.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1,
          ease: [0.16, 1, 0.3, 1], // Custom spring animation
        }}
        viewport={{ once: true }}
        className="relative"
      >
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 50,
            ease: "linear",
            repeat: Infinity,
          }}
          className="absolute inset-0 bg-gradient-to-r from-[#3AEBA5] to-transparent opacity-10 rounded-full blur-xl"
        />
        <Image
          src={"/assets/home/big-logo.svg"}
          alt="logo"
          width={614.43}
          height={583}
          className="object-contain justify-self-center relative z-10"
        />
      </motion.div>
    </section>
  );
};

export default Introduction;
