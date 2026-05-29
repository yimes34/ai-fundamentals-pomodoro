import { useEffect, useState } from "react";

function Subjects({ selectedSubject, onChangeSubject, onSubjectsChange }) {
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState("");

  const loadSubjects = () => {
    fetch("http://127.0.0.1:5000/subjects")
      .then((response) => response.json())
      .then((data) => {
        setSubjects(data);
      });
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const onSubmitSubject = (event) => {
    event.preventDefault();

    const trimmedSubjectName = newSubjectName.trim();

    if (!trimmedSubjectName) {
      return;
    }

    fetch("http://127.0.0.1:5000/subjects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: trimmedSubjectName,
      }),
    })
      .then((response) => response.json())
      .then((createdSubject) => {
        setSubjects((currentSubjects) => [...currentSubjects, createdSubject]);
        setNewSubjectName("");
        onSubjectsChange();
      });
  };

  const onDeleteSubject = (subjectId) => {
    fetch(`http://127.0.0.1:5000/subjects/${subjectId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then(() => {
        setSubjects((currentSubjects) =>
          currentSubjects.filter((subject) => subject.id !== subjectId),
        );

        if (Number(selectedSubject) === subjectId) {
          onChangeSubject("");
        }

        onSubjectsChange();
      });
  };

  return (
    <section>
      <h2>Subjects</h2>

      <form onSubmit={onSubmitSubject} className="add-subject-form">
        <input
          type="text"
          className="new-subject-input"
          placeholder="New subject"
          value={newSubjectName}
          onChange={(event) => setNewSubjectName(event.target.value)}
        />
        <button type="submit" className="add-subject-button">
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
            className="lucide lucide-book-plus-icon lucide-book-plus"
          >
            <path d="M12 7v6" />
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
            <path d="M9 10h6" />
          </svg>
        </button>
      </form>

      <ul className="subjects-list">
        {subjects.map((subject) => (
          <li key={subject.id}>
            <span>{subject.name}</span>
            <button type="button" onClick={() => onDeleteSubject(subject.id)}>
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
                className="lucide lucide-book-minus-icon lucide-book-minus"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                <path d="M9 10h6" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Subjects;
