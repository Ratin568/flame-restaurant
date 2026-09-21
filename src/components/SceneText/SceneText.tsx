import styles from "./SceneText.module.css";

type SceneTextProps = {
  chapter: string;
  title: string;
  description: string;
};

function cleanStoryText(value: string) {
  return value
    .replace(/\s+\.$/, "")
    .replace(/\.$/, "");
}

export default function SceneText({
  chapter,
  title,
  description,
}: SceneTextProps) {
  return (
    <div className={styles.container}>
      <span className={styles.chapter}>
        {cleanStoryText(chapter)}
      </span>

      <h1 className={styles.title}>
        {cleanStoryText(title)}
      </h1>

      <p className={styles.description}>
        {cleanStoryText(description)}
      </p>
    </div>
  );
}