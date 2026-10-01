"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { CONTACT, waLink } from "@/lib/utils";

export default function WhatsAppFloat() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/card") || pathname === "/login") return null;

  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col gap-3">
      <motion.a
        href={waLink("مرحباً، أرغب بالاستفسار عن سياراتكم المعروضة 🚗")}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-glow"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.6.2-.8l.4-.5c.1-.2.2-.3.3-.5v-.5c0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.9 2.9 4.6 4.1.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.2-.6-.4z" />
        </svg>
      </motion.a>
      <motion.a
        href={`tel:${CONTACT.phone}`}
        aria-label="Call"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-ishtar-500 to-ishtar-800 shadow-glow"
      >
        <Phone className="h-6 w-6 text-white" />
      </motion.a>
    </div>
  );
}
