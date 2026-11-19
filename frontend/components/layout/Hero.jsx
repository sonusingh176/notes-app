import styles from "@/app/page.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
    
    
      <h1 className="text-4xl md:text-6xl font-bold leading-tight">

        <span className="text-[#b480ff]"> Ace</span>
        <br />
         your next tech interview
        <br />
        with <span className="text-[#b480ff]">confidence</span>
      </h1>

    </section>
  );
}