const cards = [
  { title: "Users", desc: "Manage users and roles" },
  { title: "Sellers", desc: "KYC, verification, payouts" },
  { title: "Orders", desc: "Track lifecycle and disputes" },
  { title: "Inventory", desc: "Product stock and catalog" },
  { title: "Audit Logs", desc: "Admin actions and order history" },
  { title: "Analytics", desc: "GMV, conversions, fulfillment" },
];

export default function DashboardPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "32px auto", padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Admin Dashboard</h1>
      <p style={{ color: "#475569", marginBottom: 20 }}>Production wiring can call backend APIs with JWT.</p>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
        {cards.map((card) => (
          <article key={card.title} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
            <h3 style={{ marginTop: 0 }}>{card.title}</h3>
            <p style={{ marginBottom: 0, color: "#64748b" }}>{card.desc}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
