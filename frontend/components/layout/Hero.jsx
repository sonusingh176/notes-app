import styles from "@/app/page.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
    
      <h1 className={styles.title}>
        Ace your next tech interview
        <br />
        with <span>confidence</span>
      </h1>

    </section>
  );
}