"use client";

import {
  type MotionValue,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

import { fadeUp } from "@/lib/motion";

const MISSION_VIDEO = "/assets/mission-bg.mp4";

const PARAGRAPH_ONE =
  "We're building a world where every developer who opens LeetCode can find a partner instantly — where the lonely grind becomes a shared journey, and every breakthrough is celebrated together.";

const PARAGRAPH_TWO =
  "Real-time collaboration, live video, and seamless code sharing — built for the way you actually prepare for interviews.";

const HIGHLIGHTED = new Set(["lonely", "grind", "shared", "journey"]);

const isHighlighted = (word: string) =>
  HIGHLIGHTED.has(word.toLowerCase().replace(/[^a-z']/g, ""));

interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  highlighted: boolean;
}

function Word({ children, progress, range, highlighted }: WordProps) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span
      style={{ opacity }}
      className={highlighted ? "text-foreground" : "text-hero-subtitle"}
    >
      {children}{" "}
    </motion.span>
  );
}

export function Mission() {
  const textRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ["start 0.85", "end 0.45"],
  });

  const wordsOne = PARAGRAPH_ONE.split(" ");
  const wordsTwo = PARAGRAPH_TWO.split(" ");
  const total = wordsOne.length + wordsTwo.length;
  const rangeFor = (index: number): [number, number] => [
    index / total,
    (index + 1) / total,
  ];

  return (
    <section id="philosophy" className="px-6 pb-32 pt-0 md:pb-44">
      <motion.div {...fadeUp(0)} className="mx-auto flex justify-center">
        <video
          className="aspect-square w-full max-w-[800px] object-cover"
          src={MISSION_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
        />
      </motion.div>

      <div
        ref={textRef}
        className="mx-auto mt-16 max-w-5xl text-center md:mt-24"
      >
        <p className="text-2xl font-medium tracking-[-1px] md:text-4xl lg:text-5xl">
          {wordsOne.map((word, i) => (
            <Word
              key={`p1-${i}`}
              progress={scrollYProgress}
              range={rangeFor(i)}
              highlighted={isHighlighted(word)}
            >
              {word}
            </Word>
          ))}
        </p>
        <p className="mt-10 text-xl font-medium md:text-2xl lg:text-3xl">
          {wordsTwo.map((word, i) => (
            <Word
              key={`p2-${i}`}
              progress={scrollYProgress}
              range={rangeFor(wordsOne.length + i)}
              highlighted={false}
            >
              {word}
            </Word>
          ))}
        </p>
      </div>
    </section>
  );
}
