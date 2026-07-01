function DashboardStats({ documents, userId }) {
  // Count documents owned by the logged-in user.
  const owned = documents.filter((doc) => doc.owner?._id === userId).length;

  // Remaining documents are shared with the user.
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
      {stats.map((item) => (
        <article key={item.label} className="stat-card">
          <div className="stat-icon">
            <lord-icon
              src={item.icon}
              trigger="hover"
              state="hover-jump"
              style={{
                width: "42px",
                height: "42px",
              }}
            />
          </div>

          {/* Keep the value and label together so they align nicely beside the icon. */}
          <div className="stat-content">
            <h2>{item.value}</h2>
            <p>{item.label}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

export default DashboardStats;
