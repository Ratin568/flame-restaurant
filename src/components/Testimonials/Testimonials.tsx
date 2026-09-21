import styles from "./Testimonials.module.css";

type Testimonial = {
  text: string;
  name: string;
  role: string;
};

const testimonials: Testimonial[] = [
  {
    text: "Nexa AI completely changed the way we build websites.",
    name: "Alex Morgan",
    role: "Product Designer",
  },
  {
    text: "What used to take days now takes only a few hours.",
    name: "Sarah Wilson",
    role: "Founder",
  },
  {
    text: "The combination of great design and AI is incredibly powerful.",
    name: "Daniel Smith",
    role: "Developer",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className={styles.testimonials}
    >
      <div className={styles.testimonialsContainer}>
        <div className={styles.sectionHeading}>
          <span>TESTIMONIALS</span>

          <h2>Loved by creators</h2>
        </div>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial) => (
            <div
              className={styles.testimonialCard}
              key={testimonial.name}
            >
              <p>"{testimonial.text}"</p>

              <div className={styles.testimonialAuthor}>
                <strong>{testimonial.name}</strong>

                <span>{testimonial.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}