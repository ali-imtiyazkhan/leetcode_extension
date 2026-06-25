"use client";

import { motion } from "framer-motion";

import { fadeUp } from "@/lib/motion";

const PLATFORMS = [
  {
    title: "See Who's Here",
    description:
      "Instantly see how many other users are viewing the same LeetCode problem as you right now.",
  },
  {
    title: "One-Click Invite",
    description:
      "Send a collaboration request to any active user with a single click. No waiting, no coordination.",
  },
  {
    title: "Instant Sync",
    description:
      "Jump straight into a shared session with code sync and a live video feed.",
  },
];

export function SearchChanged() {
  return (
    <section id="how-it-works" className="px-6 pb-6 pt-52 md:pb-9 md:pt-64">
      <div className="mx-auto max-w-6xl text-center">
        <motion.h2
          {...fadeUp(0)}
          className="text-5xl font-medium tracking-[-2px] md:text-7xl lg:text-8xl"
        >
          Practice{" "}
          <em className="font-serif font-normal italic">Together.</em>
          <br />
          Grow Faster.
        </motion.h2>

        <motion.p
          {...fadeUp(0.1)}
          className="mx-auto mb-24 mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          LeetCode interview prep doesn&apos;t have to be lonely. With
          LeetCollab, you&apos;re never more than one click away from a study
          partner.
        </motion.p>

        <div className="mb-20 grid gap-12 md:grid-cols-3 md:gap-8">
          {PLATFORMS.map(({ title, description }, i) => (
            <motion.article
              key={title}
              {...fadeUp(0.15 + i * 0.1)}
              className="flex flex-col items-center"
            >
              <div className="liquid-glass mb-8 flex h-[200px] w-[200px] items-center justify-center rounded-2xl">
                <span className="text-6xl font-bold text-foreground/20">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </motion.article>
          ))}
        </div>

        <motion.p
          {...fadeUp(0.2)}
          className="text-center text-sm text-muted-foreground"
        >
          The best way to prepare for interviews is with a partner.
        </motion.p>
      </div>
    </section>
  );
}
