"use client";

import { Bell, CircleUserRound, Headset, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation";

const navLinks = [
  {
    title: "About",
    href: "#introduction",
  },
  {
    title: "Why Us",
    href: "#features",
  },
  {
    title: "How it works",
    href: "#how-it-works",
  },
];

const menuVariants: Variants = {
  closed: {
    opacity: 0,
    x: "100%",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  open: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const menuItemVariants: Variants = {
  closed: { x: 50, opacity: 0 },
  open: (i) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setIsMenuOpen(false);

    const element = document.querySelector(href);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleClick = () => {
    router.push("/signin");
  };

  return (
    <header className="fixed top-0 left-0 right-0 padding-x pt-6 md:pt-4 h-auto z-50 bg-[#0A0A0A]/80 backdrop-blur-sm">
      <div className="flex items-center justify-between bg-[#FFFFFF0D] md:bg-transparent p-4 rounded-[22px]">
        <div className="flex items-center gap-4 lg:gap-[9rem]">
          <Link href={"/"}>
            <Image
              src={"/assets/logo.svg"}
              alt="logo"
              height={50}
              width={120.93}
              className="hidden lg:block"
            />
          </Link>
          <Image
            src={"/assets/logo-sm.svg"}
            alt="logo"
            height={40}
            width={40}
            className="lg:hidden"
          />
          <nav className="lg:flex items-center gap-20 hidden">
            {navLinks.map((item, index) => (
              <div key={index}>
                <Link
                  href={item.href}
                  onClick={(e) => handleScroll(e, item.href)}
                  className="font-primary font-medium text-[16px] hover:text-primary transition-colors"
                >
                  {item.title}
                </Link>
              </div>
            ))}
          </nav>
        </div>
        <div className="lg:flex items-center gap-4 hidden">
          <button
            className="h-[42px] w-[42px] bg-[#181818] rounded-[9.13px] flex items-center justify-center cursor-pointer hover:bg-[#242424] transition-colors"
            onClick={handleClick}
          >
            <Bell color="#B6B6B6" size={25} />
          </button>
          <button
            className="h-[42px] w-[42px] bg-[#181818] rounded-[9.13px] flex items-center justify-center cursor-pointer hover:bg-[#242424] transition-colors"
            onClick={handleClick}
          >
            <Headset color="#B6B6B6" size={25} />
          </button>
          <button
            className="h-[42px] w-[42px] bg-[#181818] rounded-[9.13px] flex items-center justify-center cursor-pointer hover:bg-[#242424] transition-colors"
            onClick={handleClick}
          >
            <CircleUserRound color="#B6B6B6" size={25} />
          </button>
        </div>
        <button
          className="h-[48px] w-[48px] lg:hidden bg-[#FAFAFA0A] border-[0.5px] border-[#1F1F1F] rounded-[172px] flex items-center justify-center cursor-pointer z-[60]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X size={20} className="text-[#FFFFFF]" />
          ) : (
            <Menu size={20} className="text-[#FFFFFF]" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 top-0 bg-[#0A0A0A] z-50 lg:hidden min-h-screen pt-24"
          >
            <div className="flex flex-col items-center justify-start h-full gap-8 px-6 overflow-y-auto">
              <Image
                src={"/assets/logo-sm.svg"}
                alt="logo"
                height={60}
                width={60}
                className="mb-8"
              />
              {navLinks.map((item, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={menuItemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="w-full text-center"
                >
                  <Link
                    href={item.href}
                    onClick={(e) => handleScroll(e, item.href)}
                    className="font-primary font-medium text-[24px] hover:text-primary transition-colors block py-2"
                  >
                    {item.title}
                  </Link>
                </motion.div>
              ))}
              <div className="flex items-center gap-4 mt-8">
                <motion.button
                  variants={menuItemVariants}
                  custom={4}
                  className="h-[42px] w-[42px] bg-[#181818] rounded-[9.13px] flex items-center justify-center cursor-pointer hover:bg-[#242424] transition-colors"
                  onClick={handleClick}
                >
                  <Bell color="#B6B6B6" size={25} />
                </motion.button>
                <motion.button
                  variants={menuItemVariants}
                  custom={5}
                  className="h-[42px] w-[42px] bg-[#181818] rounded-[9.13px] flex items-center justify-center cursor-pointer hover:bg-[#242424] transition-colors"
                  onClick={handleClick}
                >
                  <Headset color="#B6B6B6" size={25} />
                </motion.button>
                <motion.button
                  variants={menuItemVariants}
                  custom={6}
                  className="h-[42px] w-[42px] bg-[#181818] rounded-[9.13px] flex items-center justify-center cursor-pointer hover:bg-[#242424] transition-colors"
                  onClick={handleClick}
                >
                  <CircleUserRound color="#B6B6B6" size={25} />
                </motion.button>
              </div>
              <button
                className="text-[24px] font-semibold bg-[#3AEBA5] text-[#1E1E1E] py-[8px] w-[237px] z-10 md:top-32 cursor-pointer drop-shadow-2xl drop-shadow-[#14803A] rounded-[13.5px]"
                onClick={() => router.push("/signup")}
              >
                Create Account
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
