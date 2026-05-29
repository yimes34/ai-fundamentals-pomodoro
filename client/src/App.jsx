import { useRef, useState, useEffect, useCallback } from "react";
import "./App.css";
import Timer from "./components/Timer";
import Subjects from "./components/Subjects";
import History from "./components/History";
import Statistics from "./components/Statistics";

const TIMER_STORAGE_KEY = "pomodoroTimerState";
const MAX_FOCUS_MINUTES = 60;
const BREAK_SECONDS = 5 * 60;
const API_URL = "https://ai-fundamentals-pomodoro-production.up.railway.app";

const getInitialTimerState = () => {
  const defaultTimerState = {
    focusMinutes: 25,
    secondsLeft: 25 * 60,
    selectedSubject: "",
  };

  const savedTimerState = localStorage.getItem(TIMER_STORAGE_KEY);

  if (!savedTimerState) {
    return defaultTimerState;
  }

  try {
    const parsedTimerState = JSON.parse(savedTimerState);
    const focusMinutes = Number(parsedTimerState.focusMinutes) || 25;
    const secondsLeft = Number(parsedTimerState.secondsLeft);

    return {
      focusMinutes,
      secondsLeft: secondsLeft > 0 ? secondsLeft : focusMinutes * 60,
      selectedSubject: parsedTimerState.selectedSubject || "",
    };
  } catch {
    return defaultTimerState;
  }
};

function App() {
  const [initialTimerState] = useState(getInitialTimerState);
  const [focusMinutes, setFocusMinutes] = useState(
    initialTimerState.focusMinutes,
  );
  const focusSeconds = focusMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(initialTimerState.secondsLeft);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(
    initialTimerState.selectedSubject,
  );
  const [activeTab, setActiveTab] = useState("timer");
  const [isTimerFinished, setIsTimerFinished] = useState(false);
  const [timerMode, setTimerMode] = useState("focus");
  const [focusMinutesMessage, setFocusMinutesMessage] = useState("");
  const [historySessions, setHistorySessions] = useState([]);
  const [historySubjects, setHistorySubjects] = useState([]);
  const [historySubjectFilter, setHistorySubjectFilter] = useState("");
  const [historyDateRange, setHistoryDateRange] = useState("all");
  const intervalIdRef = useRef(null);
  const secondsLeftRef = useRef(initialTimerState.secondsLeft);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${String(seconds).padStart(2, "0")}`;
  const hasValidSelectedSubject = historySubjects.some(
    (subject) => subject.id === Number(selectedSubject),
  );

  useEffect(() => {
    localStorage.setItem(
      TIMER_STORAGE_KEY,
      JSON.stringify({
        focusMinutes,
        secondsLeft,
        selectedSubject,
      }),
    );
  }, [focusMinutes, secondsLeft, selectedSubject]);

  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  const loadSubjects = useCallback(() => {
    fetch(`${API_URL}/subjects`)
      .then((response) => response.json())
      .then((data) => {
        setHistorySubjects(data);
      });
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const loadHistorySessions = useCallback(() => {
    const queryParams = new URLSearchParams();

    if (historySubjectFilter) {
      queryParams.set("subject_id", historySubjectFilter);
    }

    queryParams.set("range", historyDateRange);

    fetch(`${API_URL}/sessions?${queryParams.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        setHistorySessions(data);
      });
  }, [historySubjectFilter, historyDateRange]);

  useEffect(() => {
    loadHistorySessions();
  }, [loadHistorySessions]);

  const saveSession = (duration) => {
    if (!selectedSubject || duration <= 0) {
      return;
    }

    fetch(`${API_URL}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject_id: Number(selectedSubject),
        duration,
      }),
    }).then(() => {
      loadHistorySessions();
    });
  };

  const startBreakTimer = () => {
    setTimerMode("break");
    setSecondsLeft(BREAK_SECONDS);
    secondsLeftRef.current = BREAK_SECONDS;
    setIsRunning(true);

    intervalIdRef.current = setInterval(() => {
      const nextSecondsLeft = secondsLeftRef.current - 1;

      if (nextSecondsLeft <= 0) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
        setIsRunning(false);
        setTimerMode("focus");
        setSecondsLeft(focusSeconds);
        secondsLeftRef.current = focusSeconds;
        return;
      }

      setSecondsLeft(nextSecondsLeft);
    }, 1000);
  };

  const onStart = () => {
    if (isRunning || (timerMode === "focus" && !hasValidSelectedSubject)) {
      return;
    }

    setIsRunning(true);
    intervalIdRef.current = setInterval(() => {
      const nextSecondsLeft = secondsLeftRef.current - 1;

      if (nextSecondsLeft <= 0) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
        setIsRunning(false);
        setSecondsLeft(0);

        if (timerMode === "focus") {
          setIsTimerFinished(true);
          saveSession(focusMinutes);

          setTimeout(() => {
            setIsTimerFinished(false);
            startBreakTimer();
          }, 3000);
        } else {
          setTimerMode("focus");
          setSecondsLeft(focusSeconds);
          secondsLeftRef.current = focusSeconds;
        }

        return;
      }

      setSecondsLeft(nextSecondsLeft);
    }, 1000);
  };

  const onPause = () => {
    clearInterval(intervalIdRef.current);
    intervalIdRef.current = null;
    setIsRunning(false);
  };

  const onSaveAndReset = () => {
    if (timerMode === "break") {
      setTimerMode("focus");
      setSecondsLeft(focusSeconds);
      secondsLeftRef.current = focusSeconds;
      return;
    }

    const elapsedSeconds = focusSeconds - secondsLeft;
    const elapsedMinutes = Number((elapsedSeconds / 60).toFixed(2));
    saveSession(elapsedMinutes);
    setSecondsLeft(focusSeconds);
    secondsLeftRef.current = focusSeconds;
  };

  const onReset = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setIsRunning(false);
    setTimerMode("focus");
    setIsTimerFinished(false);
    setSecondsLeft(focusSeconds);
    secondsLeftRef.current = focusSeconds;
  };

  const onDeleteSession = (sessionId) => {
    fetch(`${API_URL}/sessions/${sessionId}`, {
      method: "DELETE",
    }).then(() => {
      loadHistorySessions();
    });
  };

  const getSubjectName = (session) => {
    if (session.subject_name) {
      return session.subject_name;
    }

    const subject = historySubjects.find(
      (item) => item.id === session.subject_id,
    );

    if (!subject) {
      return "Unknown subject";
    }

    return subject.name;
  };

  return (
    <main
      className={[
        isTimerFinished ? "timer-finished" : "",
        timerMode === "break" ? "timer-break" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h1>Focus Timer</h1>
      <nav aria-label="Pomodoro sections">
        <button
          type="button"
          onClick={() => setActiveTab("timer")}
          disabled={activeTab === "timer"}
        >
          Timer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("subjects")}
          disabled={activeTab === "subjects"}
        >
          Subjects
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          disabled={activeTab === "history"}
        >
          History
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("statistics")}
          disabled={activeTab === "statistics"}
        >
          Statistics
        </button>
      </nav>
      {activeTab === "timer" && (
        <Timer
          formattedTime={formattedTime}
          timerMode={timerMode}
          isTimerFinished={isTimerFinished}
          focusMinutesMessage={focusMinutesMessage}
          selectedSubject={selectedSubject}
          onChangeSubject={setSelectedSubject}
          subjects={historySubjects}
          focusMinutes={focusMinutes}
          onChangeFocusMinutes={(event) => {
            const nextFocusMinutes = Number(event.target.value);

            if (nextFocusMinutes > MAX_FOCUS_MINUTES) {
              setFocusMinutesMessage("maxFocusMinutes");
              setFocusMinutes(MAX_FOCUS_MINUTES);

              if (!isRunning && timerMode === "focus") {
                setSecondsLeft(MAX_FOCUS_MINUTES * 60);
                secondsLeftRef.current = MAX_FOCUS_MINUTES * 60;
              }

              return;
            }

            setFocusMinutesMessage("");
            setFocusMinutes(nextFocusMinutes);

            if (!isRunning && timerMode === "focus") {
              setSecondsLeft(nextFocusMinutes * 60);
              secondsLeftRef.current = nextFocusMinutes * 60;
            }
          }}
          isRunning={isRunning}
          secondsLeft={secondsLeft}
          focusSeconds={focusSeconds}
          hasSelectedSubject={hasValidSelectedSubject}
          onStart={onStart}
          onPause={onPause}
          onSaveAndReset={onSaveAndReset}
          onReset={onReset}
        />
      )}

      {activeTab === "subjects" && (
        <Subjects
          selectedSubject={selectedSubject}
          onChangeSubject={setSelectedSubject}
          onSubjectsChange={loadSubjects}
        />
      )}

      {activeTab === "history" && (
        <History
          historySessions={historySessions}
          historySubjects={historySubjects}
          historySubjectFilter={historySubjectFilter}
          historyDateRange={historyDateRange}
          setHistorySubjectFilter={setHistorySubjectFilter}
          setHistoryDateRange={setHistoryDateRange}
          onDeleteSession={onDeleteSession}
          getSubjectName={getSubjectName}
        />
      )}

      {activeTab === "statistics" && <Statistics />}
    </main>
  );
}

export default App;
