"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const AnimatedCursor = () => {
  const [isMobile, setIsMobile] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // More fluid spring config
  const springConfig = { damping: 15, stiffness: 150, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // State for cursor scale on click
  const [isClicking, setIsClicking] = useState(false);
  // State for cursor scale on hovering clickable elements
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = "none";

    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const moveCursor = (e: MouseEvent) => {
      // Adjusted offset for better centering
      cursorX.set(e.clientX - 12);
      cursorY.set(e.clientY - 12);
    };

    // Handle cursor hovering over clickable elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "button" ||
        target.tagName.toLowerCase() === "a" ||
        target.closest("button") ||
        target.closest("a") ||
        target.classList.contains("cursor-hover")
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    // Handle mouse events
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Add event listeners
    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      // Reset cursor on unmount
      document.body.style.cursor = "auto";

      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", checkMobile);
    };
  }, [cursorX, cursorY]);

  if (isMobile) return null;

  return (
    <>
      {/* Main cursor (donut) */}
      <motion.div
        className="cursor-main fixed pointer-events-none z-50"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <motion.div
          className="relative"
          animate={{
            scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 15,
            mass: 0.5,
          }}
        >
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full blur-sm bg-[#3AEBA5] opacity-30" />

          {/* Main donut ring */}
          <div className="w-6 h-6 rounded-full border-2 border-[#3AEBA5] relative">
            {/* Inner gradient fill */}
            <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-[#3AEBA5] to-transparent opacity-20" />
          </div>
        </motion.div>
      </motion.div>

      {/* Trailer cursor (subtle ring) */}
      <motion.div
        className="cursor-trailer fixed pointer-events-none z-40"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <motion.div
          className="relative"
          animate={{
            scale: isHovering ? 2 : 1.5,
            opacity: isHovering ? 0.5 : 0.2,
          }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 15,
            mass: 0.5,
          }}
        >
          {/* Subtle outer ring */}
          <div className="w-8 h-8 rounded-full border border-[#3AEBA5] opacity-50" />

          {/* Extra subtle glow effect */}
          <div className="absolute inset-0 rounded-full blur-md bg-[#3AEBA5] opacity-10" />
        </motion.div>
      </motion.div>
    </>
  );
};

export default AnimatedCursor;
