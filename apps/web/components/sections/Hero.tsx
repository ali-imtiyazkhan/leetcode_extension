"use client";

import { motion } from "framer-motion";
import { Check, Code2, Users } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Input } from "@/components/ui/input";
import { fadeUp } from "@/lib/motion";

const HERO_VIDEO = "/assets/hero-bg.mp4";

export function Hero() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={HERO_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 flex w-full flex-col items-center px-6 pt-28 text-center md:pt-32">
        <motion.div {...fadeUp(0)} className="mb-8 flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-border/40 bg-background/20 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
            <Users className="h-4 w-4 text-foreground" />
            <span>
              <strong className="text-foreground">1,200+</strong> developers
              collaborating
            </span>
          </div>
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          className="text-5xl font-medium tracking-[-2px] md:text-7xl lg:text-8xl"
        >
          Don&apos;t Solve{" "}
          <em className="font-serif font-normal italic">Alone</em>{" "}
          <br className="hidden md:block" />
          Anymore
        </motion.h1>

        <motion.p
          {...fadeUp(0.2)}
          className="mt-6 max-w-xl text-lg text-hero-subtitle"
        >
          Connect with live developers currently tackling the same LeetCode
          problem. Start a video call, share insights, and master DSA together.
        </motion.p>

        <motion.form
          {...fadeUp(0.3)}
          onSubmit={handleSubmit}
          className="liquid-glass mt-10 flex w-full max-w-lg items-center gap-2 rounded-full p-2"
        >
          <label htmlFor="hero-email" className="sr-only">
            Email address
          </label>
          <Input
            id="hero-email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSubscribed(false);
            }}
            placeholder="Enter your email"
            className="h-auto flex-1 border-0 bg-transparent px-5 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex shrink-0 items-center gap-2 rounded-full bg-foreground px-8 py-3 text-sm font-semibold tracking-wide text-background"
          >
            {subscribed ? (
              <>
                <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                <span>JOINED</span>
              </>
            ) : (
              "GET EARLY ACCESS"
            )}
          </motion.button>
        </motion.form>

        <motion.div
          {...fadeUp(0.4)}
          className="mt-12 flex items-center gap-8 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-foreground" />
            Live presence
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-foreground" />
            Instant invites
          </span>
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Video calls
          </span>
        </motion.div>
      </div>
    </section>
  );
}
