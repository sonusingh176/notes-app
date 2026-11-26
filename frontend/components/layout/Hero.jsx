import styles from "@/app/page.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <h1 className="text-4xl font-bold leading-tight md:text-6xl">
        <span className="bg-gradient-to-r from-[#f97316] to-[#fbbf24] bg-clip-text text-transparent">
          Ace
        </span>
        <br />
        your next tech interview
        <br />
        with{" "}
        <span className="bg-gradient-to-r from-[#f97316] to-[#fbbf24] bg-clip-text text-transparent">
          confidence
        </span>
      </h1>
    </section>
  );
}