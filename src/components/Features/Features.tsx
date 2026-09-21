import styles from "./Features.module.css";

type Feature = {
  icon: string;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: "⚡",
    title: "Lightning Fast",
    description:
      "Build and launch your projects quickly without unnecessary complexity.",
  },
  {
    icon: "🤖",
    title: "AI Powered",
    description:
      "Use artificial intelligence to turn your ideas into working products.",
  },
  {
    icon: "🎨",
    title: "Beautiful Design",
    description:
      "Create modern and responsive interfaces that look great everywhere.",
  },
];

export default function Features() {
  return (
    <section id="features" className={styles.features}>
      <div className={styles.featuresContainer}>
        <div className={styles.sectionHeading}>
          <span>FEATURES</span>

          <h2>Everything you need</h2>

          <p>
            Powerful tools designed to help you build
            better products.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((feature) => (
            <div
              className={styles.featureCard}
              key={feature.title}
            >
              <div className={styles.featureIcon}>
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}