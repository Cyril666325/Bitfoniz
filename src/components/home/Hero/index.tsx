"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, easeOut, easeInOut } from "framer-motion";

const textVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easeOut,
    },
  },
};

const backgroundTextVariants = {
  hidden: {
    opacity: 0,
    scale: 1.2,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: easeOut,
    },
  },
};

const imageVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 2,
      ease: easeInOut,
    },
  },
};

const buttonVariants = {
  initial: {
    opacity: 0,
    y: 50,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.5,
      ease: easeInOut,
    },
  },
  hover: {
    scale: 1.05,
    y: -3,
    transition: {
      duration: 0.3,
      ease: easeOut,
    },
  },
  tap: {
    scale: 0.97,
  },
};

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const Hero = () => {
  const router = useRouter();
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative max-container padding-x md:py-[8rem] flex items-center flex-col justify-center h-[500px]"
    >
      <motion.h1
        variants={backgroundTextVariants}
        className="absolute z-0 font-archivo font-bold lg:text-[298.62px] md:text-[150px] text-[75.98px] text-center uppercase bg-gradient-to-b from-[#414141] from-20% to-[#111111] to-60% bg-clip-text text-transparent pointer-events-none select-none md:top-30 top-32 lg:top-20"
      >
        BITFONIZ
      </motion.h1>
      <motion.h1
        variants={textVariants}
        className="relative md:top-20 top-4 lg:top-50 z-10 lg:text-[98px] md:text-[50px] text-[24.91px] font-bold font-sg text-center bg-gradient-to-r from-[#FCFCFC] to-[#464646b5] bg-clip-text text-transparent lg:leading-[123px] leading-[100%]"
      >
        Where Intelligence Meets Precision in Trading.
      </motion.h1>
      <motion.div
        variants={imageVariants}
        className="absolute md:w-[800px] md:h-[800px] w-[300.37px] h-[300.37px] lg:top-52 md:top-20 top-48 left-1/2 -translate-x-1/2 flex items-center justify-center -z-1"
      >
        <Image
          src={"/assets/home/equalizer.svg"}
          alt="hero image"
          fill
          priority
          className="object-contain"
        />
      </motion.div>
      <motion.button
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        variants={buttonVariants}
        className="text-[24px] font-semibold bg-[#3AEBA5] text-[#1E1E1E] py-[8px] w-[237px] relative z-10 md:top-32 -bottom-82 lg:top-58 rounded-[13.5px] cursor-pointer drop-shadow-2xl drop-shadow-[#14803A]"
        onClick={() => router.push("/signup")}
      >
        Get started
      </motion.button>
    </motion.div>
  );
};

export default Hero;
