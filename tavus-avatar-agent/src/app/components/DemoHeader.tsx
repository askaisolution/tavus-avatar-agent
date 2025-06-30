'use client';
import { useRouter } from 'next/navigation';
import styles from './DemoHeader.module.css';

export default function DemoHeader({ title }: { title: string }) {
  const router = useRouter();

  return (
    <header className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      <button className={styles.button} onClick={() => router.push('/')}>
        ← Back to Home
      </button>
    </header>
  );
}
