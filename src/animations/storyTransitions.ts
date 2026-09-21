import type { SceneTransition } from "./transition";

import {
  easeInOutCubic,
  easeOutCubic,
} from "@/lib/easing";

export const storyTransitions: SceneTransition[] = [
  /*
  |--------------------------------------------------------------------------
  | BURGER → HEAT
  |--------------------------------------------------------------------------
  */

  {
    from: "burger",
    to: "heat",

    range: {
      exit: {
        start: 0.375,
        end: 0.415,
      },

      gap: {
        start: 0.415,
        end: 0.47,
      },

      enter: {
        start: 0.455,
        end: 0.49,
      },
    },

    exitEasing:
      easeInOutCubic,

    enterEasing:
      easeOutCubic,
  },

  /*
  |--------------------------------------------------------------------------
  | HEAT → MENU
  |--------------------------------------------------------------------------
  */

  {
    from: "heat",
    to: "menu",

    range: {
      exit: {
        start: 0.625,
        end: 0.655,
      },

      gap: {
        start: 0.655,
        end: 0.78,
      },

      enter: {
        start: 0.755,
        end: 0.795,
      },
    },

    exitEasing:
      easeInOutCubic,

    enterEasing:
      easeOutCubic,
  },

  /*
  |--------------------------------------------------------------------------
  | MENU → CTA
  |--------------------------------------------------------------------------
  */

  {
    from: "menu",
    to: "cta",

    range: {
      exit: {
        start: 0.835,
        end: 0.855,
      },

      gap: {
        start: 0.855,
        end: 0.885,
      },

      enter: {
        start: 0.875,
        end: 0.915,
      },
    },

    exitEasing:
      easeInOutCubic,

    enterEasing:
      easeOutCubic,
  },
];