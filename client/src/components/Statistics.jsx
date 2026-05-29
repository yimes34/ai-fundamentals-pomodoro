import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function Statistics() {
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/statistics")
      .then((response) => response.json())
      .then((data) => {
        setStatistics(data);
      });
  }, []);

  if (!statistics) {
    return (
      <section>
        <h2>Statistics</h2>
        <p>Loading...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Statistics</h2>

      <div className="statistics-cards">
        <article className="statistics-card">
          <h3>Current Streak</h3>
          <p>{statistics.streak} days</p>
        </article>

        <article className="statistics-card">
          <h3>Total Focus Time</h3>
          <p>{statistics.total_minutes} min</p>
        </article>

        <article className="statistics-card">
          <h3>This Week</h3>
          <p>{statistics.weekly_sessions} sessions</p>
        </article>
      </div>

      <h3>Focus Time by Subject</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={statistics.subject_breakdown}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="subject" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="minutes" />
        </BarChart>
      </ResponsiveContainer>

      <h3>Weekly Pattern</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={statistics.weekly_pattern}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="minutes" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export default Statistics;
