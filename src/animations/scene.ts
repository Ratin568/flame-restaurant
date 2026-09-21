export type SceneRange = {
  start: number;
  end: number;
};

export type SceneContent = {
  title: string;
  description: string;
};

export type Scene = {
  id: string;

  range: SceneRange;

  content: SceneContent;
};