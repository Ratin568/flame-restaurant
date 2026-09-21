import styles from "./CTA.module.css";

export default function CTA() {
  return (
    <section className={styles.cta}>
      <div className={styles.ctaContainer}>
        <h2>Ready to build something amazing?</h2>

        <p>
          Start building your next project today.
        </p>

        <button className={styles.ctaButton}>
          Get Started
        </button>
      </div>
    </section>
  );
}