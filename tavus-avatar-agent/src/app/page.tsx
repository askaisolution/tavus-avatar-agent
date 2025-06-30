import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Demo Navigation</h1>
      <ul className={styles.list}>
        <li><a className={styles.link} href="/demo1">→ Demo 1</a></li>
        <li><a className={styles.link} href="/demo2">→ Demo 2</a></li>
      </ul>
    </div>
  );
}