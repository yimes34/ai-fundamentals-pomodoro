function History({
  historySessions,
  historySubjects,
  historySubjectFilter,
  historyDateRange,
  setHistorySubjectFilter,
  setHistoryDateRange,
  onDeleteSession,
  getSubjectName,
}) {
  return (
    <section>
      <h2>History</h2>

      <div className="history-filters">
        <div className="history-subject-filter">
          <label>
            Filter by subject
            <select
              value={historySubjectFilter}
              onChange={(event) => setHistorySubjectFilter(event.target.value)}
            >
              <option value="">All subjects</option>
              {historySubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="history-date-filter">
          <label>
            Filter by date
            <select
              value={historyDateRange}
              onChange={(event) => setHistoryDateRange(event.target.value)}
            >
              <option value="all">All</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </label>
        </div>
      </div>

      <table className="history-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Focus Time</th>
            <th>Date</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {historySessions.map((session) => (
            <tr key={session.id}>
              <th>{getSubjectName(session)}</th>
              <td>{session.duration} min</td>
              <td title={new Date(session.created_at).toLocaleString()}>
                {new Date(session.created_at).toLocaleDateString()}
              </td>
              <td>
                <button
                  type="button"
                  onClick={() => onDeleteSession(session.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-bookmark-minus-icon lucide-bookmark-minus"
                  >
                    <path d="M15 10H9" />
                    <path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default History;
