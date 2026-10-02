import styles from "@/app/page.module.css";

export default function Categories() {
  return (
    <section className={styles.categoriesSection}>
      <div className={styles.categoriesBox}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${styles.active}`}
          >
            Web & Mobile Dev
          </button>

          <button className={styles.tab}>
            Data Structures
          </button>

          <button className={styles.tab}>
            System Design
          </button>

          <button className={styles.tab}>
            Machine Learning
          </button>
        </div>

        <div className={styles.buttons}>
          <span>Node.js</span>
          <span>React</span>
          <span>Next.js</span>
          <span>JavaScript</span>
          <span>MongoDB</span>
          <span>PHP</span>
          <span>AWS</span>
          <span>HTML5</span>
        </div>
      </div>
    </section>
  );
}