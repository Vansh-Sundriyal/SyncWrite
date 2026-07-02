function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <lord-icon
        src="https://cdn.lordicon.com/wjyqkiew.json"
        trigger="hover"
        style={{
          width: "24px",
          height: "24px",
        }}
      />

      <input
        type="text"
        aria-label="Search documents"
        placeholder="Search your workspace..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;