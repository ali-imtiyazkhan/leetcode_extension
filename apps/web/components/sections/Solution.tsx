"use client";

import { motion } from "framer-motion";

import { fadeUp } from "@/lib/motion";

const SOLUTION_VIDEO = "/assets/solution-bg.mp4";

const FEATURES = [
  {
    title: "Live Presence",
    description:
      "See who else is viewing the same problem in real time. No sign-up needed — just open a problem and look for the indicator.",
  },
  {
    title: "Instant Invites",
    description:
      "Click to invite any active user to collaborate. They'll get a notification and can accept with one click.",
  },
  {
    title: "Video Calls",
    description:
      "Built-in WebRTC video chat so you can talk through approaches, whiteboard ideas, and debug together.",
  },
  {
    title: "Code Sync",
    description:
      "Shared code editor with real-time cursor sync. Watch your partner type and jump in whenever you have a suggestion.",
  },
];

export function Solution() {
  return (
    <section
      id="use-cases"
      className="border-t border-border/30 px-6 py-32 md:py-44"
    >
      <div className="mx-auto max-w-6xl">
        <motion.p
          {...fadeUp(0)}
          className="text-center text-xs uppercase tracking-[3px] text-muted-foreground"
        >
          Solution
        </motion.p>

        <motion.h2
          {...fadeUp(0.1)}
          className="mt-6 text-center text-4xl font-medium tracking-[-1px] md:text-6xl"
        >
          Built for collaborative{" "}
          <em className="font-serif font-normal italic">interview prep</em>
        </motion.h2>

        <motion.div {...fadeUp(0.2)} className="mt-16 md:mt-20">
          <video
            className="aspect-[3/1] w-full rounded-2xl object-cover"
            src={SOLUTION_VIDEO}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden
          />
        </motion.div>

        <div className="mt-16 grid gap-8 md:mt-20 md:grid-cols-4">
          {FEATURES.map(({ title, description }, i) => (
            <motion.article key={title} {...fadeUp(0.25 + i * 0.08)}>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
