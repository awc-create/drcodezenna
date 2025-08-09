// src/constants/heroFallbacks.ts

export const heroFallbacks = {
  home: {
    subtitle: 'Crafted in language, carried by purpose.',
    bio: `I'm a writer, a master of ideas. Armed with degrees and an unrepentant love for semicolons, I explore the intricate dance of education and writing.||My passion lies in blending narrative with knowledge, shaping thoughts through words. With a background in academia and a voice rooted in culture, I continue to write with purpose, provoke thought, and pass on the gift of expression.`,
  },
  biography: {
  subtitle: "Knowing others is intelligence; knowing yourself is true wisdom.",
  bio: `I’m a writer. A master of ideas.||And a lifelong student of language. It started with long school essays and turned into a life of teaching, editing, and chasing clarity. I’ve spent years turning messy thoughts into clean sentences — and yes, correcting the odd public typo.`,
},
  teaching: {
    subtitle: 'Guiding minds, shaping futures.',
    bio: '', // Teaching page has no bio section
  },
  blog: {
    subtitle: 'Writing that turns the page',
    bio: '', // Blog page has no bio section
  },
} as const;

export type HeroPageKey = keyof typeof heroFallbacks;
