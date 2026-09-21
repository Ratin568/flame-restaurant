import styles from "./HowItWorks.module.css";

type Step = {
  number: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: "01",
    title: "Describe your idea",
    description:
      "Tell the AI what you want to build using simple language.",
  },
  {
    number: "02",
    title: "Generate your project",
    description:
      "AI creates the structure and components needed for your website.",
  },
  {
    number: "03",
    title: "Launch",
    description:
      "Customize your project and publish it when you're ready.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className={styles.howItWorks}
    >
      <div className={styles.howContainer}>
        <div className={styles.sectionHeading}>
          <span>HOW IT WORKS</span>

          <h2>From idea to website</h2>

          <p>Three simple steps are all it takes.</p>
        </div>

        <div className={styles.steps}>
          {steps.map((step) => (
            <div className={styles.step} key={step.number}>
              <div className={styles.stepNumber}>
                {step.number}
              </div>

              <h3>{step.title}</h3>

              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}