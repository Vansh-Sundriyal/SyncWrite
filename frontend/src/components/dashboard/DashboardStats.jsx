function DashboardStats({ documents, userId }) {
  const owned = documents.filter(
    (doc) => doc.owner?._id === userId
  ).length;

  const shared = documents.length - owned;

  const stats = [
    {
      label: "Documents",
      value: documents.length,
      icon: "https://cdn.lordicon.com/hmpomorl.json",
    },
    {
      label: "Owned",
      value: owned,
      icon: "https://cdn.lordicon.com/ogjpwrxe.json",
    },
    {
      label: "Shared",
      value: shared,
      icon: "https://cdn.lordicon.com/ucfjvctd.json",
    },
  ];

  return (
    <section className="stats-grid">
      {stats.map(({ label, value, icon }) => (
        <article key={label} className="stat-card">
          <div className="stat-icon">
            <lord-icon
              src={icon}
              trigger="hover"
              state="hover-jump"
              style={{
                width: "42px",
                height: "42px",
              }}
            />
          </div>

          <div className="stat-content">
            <h2>{value}</h2>
            <p>{label}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

export default DashboardStats;