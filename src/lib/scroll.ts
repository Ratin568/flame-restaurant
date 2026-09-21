export function getLocalProgress(
  progress: number,
  start: number,
  end: number
): number {
  if (
    !Number.isFinite(progress) ||
    !Number.isFinite(start) ||
    !Number.isFinite(end)
  ) {
    return 0;
  }

  if (end <= start) {
    return 0;
  }

  const localProgress =
    (progress - start) /
    (end - start);

  return Math.min(
    Math.max(
      localProgress,
      0
    ),
    1
  );
}