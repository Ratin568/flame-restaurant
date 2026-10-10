import Image from 'next/image';
import Button3D from '@/components/ui/button-3d';
import styles from './FlameHero.module.css';

type Props = {
  title: string;
  subtitle: string;
  primary: string;
  secondary: string;
};

export default function FlameHero({
  title,
  subtitle,
  primary,
  secondary,
}: Props) {
  return (
    <section className={styles.hero}>
      <div className={styles.center}>
        <h1>{title}</h1>

        <p>{subtitle}</p>

        <div className={styles.actions}>
          <Button3D variant="primary" size="md">
            <span>{primary}</span>
            <span aria-hidden="true">↗</span>
          </Button3D>

          <Button3D variant="secondary" size="md">
            {secondary}
          </Button3D>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.scrollHint}>
          <picture className={styles.mouseIcon}>
            <source
              srcSet="/mouse/mouse-white.png"
              media="(prefers-color-scheme: dark)"
            />

            <Image
              src="/mouse/mouse-black.png"
              alt=""
              aria-hidden="true"
              width={70}
              height={70}
              sizes="70px"
            />
          </picture>

          <span>SCROLL TO EXPLORE</span>
        </div>
      </div>
    </section>
  );
}