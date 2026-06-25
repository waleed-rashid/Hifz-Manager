import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      const res = await api.get("/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData(res.data);
    };

    fetchData();
  }, []);

  if (!data) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1>
          Assalam o Alaikum, <span style={{ color: "#2563eb" }}>Student</span>
        </h1>
        <p style={{ color: "#666" }}>
          Let’s stay consistent with your Hifz today
        </p>
      </div>

      {/* Stats */}
      <div style={styles.cardRow}>
        <div style={styles.card}>
          <h2>🔥 {data.streak}</h2>
          <p>Current Streak</p>
        </div>

        <div style={styles.card}>
          <h2>🏆 {data.longestStreak}</h2>
          <p>Longest Streak</p>
        </div>
      </div>

      {/* Entry Section */}
      <div style={styles.entryBox}>
        <h2>What did you cover today?</h2>

        <input placeholder="Sabaq" style={styles.input} />
        <input placeholder="Sabaq Para" style={styles.input} />
        <input placeholder="Revision" style={styles.input} />

        <button style={styles.button}>Save Entry</button>
      </div>

      {/* Recent */}
      <div style={styles.recent}>
        <h2>Recent Entries</h2>

        {data.recentEntries.map((e) => (
          <div key={e.id} style={styles.entry}>
            <p><b>{e.sabaq}</b></p>
            <p style={{ fontSize: 12, color: "#666" }}>{e.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 30,
    fontFamily: "Arial",
    background: "#f6f7fb",
    minHeight: "100vh",
  },
  header: {
    marginBottom: 20,
  },
  cardRow: {
    display: "flex",
    gap: 20,
    marginBottom: 20,
  },
  card: {
    background: "white",
    padding: 20,
    borderRadius: 10,
    flex: 1,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  entryBox: {
    background: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    display: "block",
    width: "100%",
    padding: 10,
    margin: "10px 0",
  },
  button: {
    padding: 10,
    width: "100%",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  recent: {
    background: "white",
    padding: 20,
    borderRadius: 10,
  },
  entry: {
    borderBottom: "1px solid #eee",
    padding: 10,
  },
};