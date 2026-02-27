import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 960, margin: "40px auto", padding: 24 }}>
      <h1>VLCP Admin Dashboard</h1>
      <p>Admin controls for users, sellers, products, orders and analytics.</p>
      <ul>
        <li><Link href="/dashboard">Open Dashboard</Link></li>
      </ul>
    </main>
  );
}
