import type { Scene } from "./scene";
import type { SceneTransition } from "./transition";

import {
  easeInOutQuad,
  easeOutQuad,
} from "@/lib/easing";

export const storyTimeline: Scene[] = [
  {
    id: "intro",

    range: {
      start: 0,
      end: 0.20,
    },

    content: {
      title: "The Beginning",
      description:
        "Every story begins somewhere.",
    },
  },

  {
    id: "journey",

    range: {
      start: 0.30,
      end: 0.50,
    },

    content: {
      title: "The Journey",
      description:
        "The journey continues into the unknown.",
    },
  },

  {
    id: "battle",

    range: {
      start: 0.60,
      end: 0.80,
    },

    content: {
      title: "The Battle",
      description:
        "Everything changes when the battle begins.",
    },
  },

  {
    id: "ending",

    range: {
      start: 0.90,
      end: 1.00,
    },

    content: {
      title: "The End",
      description:
        "Every journey eventually reaches its end.",
    },
  },
];

export const storyTransitions: SceneTransition[] = [
  {
    from: "intro",
    to: "journey",

    range: {
      exit: {
        start: 0.17,
        end: 0.20,
      },

      gap: {
        start: 0.20,
        end: 0.30,
      },

      enter: {
        start: 0.30,
        end: 0.33,
      },
    },

    exitEasing: easeInOutQuad,
    enterEasing: easeOutQuad,
  },

  {
    from: "journey",
    to: "battle",

    range: {
      exit: {
        start: 0.57,
        end: 0.60,
      },

      gap: {
        start: 0.60,
        end: 0.70,
      },

      enter: {
        start: 0.70,
        end: 0.73,
      },
    },

    exitEasing: easeInOutQuad,
    enterEasing: easeOutQuad,
  },

  {
    from: "battle",
    to: "ending",

    range: {
      exit: {
        start: 0.77,
        end: 0.80,
      },

      gap: {
        start: 0.80,
        end: 0.90,
      },

      enter: {
        start: 0.90,
        end: 0.93,
      },
    },

    exitEasing: easeInOutQuad,
    enterEasing: easeOutQuad,
  },
];