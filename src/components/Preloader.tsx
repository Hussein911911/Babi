"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Ishtar Gate opening preloader — shown once per session */
export default function Preloader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("bm-loaded")) return;
    setShow(true);
    const t = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("bm-loaded", "1");
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          aria-hidden
        >
          {/* Gate doors */}
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 bg-ishtar-900 babylon-bg border-l-4 border-gold-500/60"
            initial={{ x: 0 }}
            animate={{ x: "-100%" }}
            transition={{ delay: 1.3, duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 bg-ishtar-900 babylon-bg border-r-4 border-gold-500/60"
            initial={{ x: 0 }}
            animate={{ x: "100%" }}
            transition={{ delay: 1.3, duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          />
          {/* Emblem */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 1.15] }}
            transition={{ duration: 1.6, times: [0, 0.3, 0.8, 1] }}
          >
            <div className="mx-auto mb-4 h-20 w-20 rounded-full border-2 border-gold-500 flex items-center justify-center shadow-glow">
              <svg viewBox="0 0 24 24" className="h-10 w-10 fill-gold-500">
                <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8z" />
              </svg>
            </div>
            <p className="text-2xl font-black text-sand">معرض بابل للسيارات</p>
            <p className="text-sm tracking-[0.35em] text-gold-500 font-en">BABYLON MOTORS</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
