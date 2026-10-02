import styles from "@/app/page.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <p className={styles.rating}>⭐⭐⭐⭐⭐</p>

      <p className={styles.review}>
        "Huge timesaver. Worth the money"
      </p>

      <h1 className={styles.title}>
        Ace your next tech interview
        <br />
        with <span>confidence</span>
      </h1>

      <p className={styles.description}>
        Explore our curated catalog of interview
        questions covering full-stack, data
        structures, algorithms, system design,
        machine learning, and more.
      </p>

      <button className={styles.heroBtn}>
        Start preparing now
      </button>
    </section>
  );
}