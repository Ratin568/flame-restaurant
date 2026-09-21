export type FlameScene = {
  id: string;
  chapter: string;
  title: string;
  description: string;
  start: number;
  end: number;
  visual: 'burger' | 'heat' | 'menu' | 'cta';
};
