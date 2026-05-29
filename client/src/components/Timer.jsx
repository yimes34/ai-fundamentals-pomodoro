const TIMER_MESSAGES = {
  idle: "타이머가 쉬고 있습니다.",
  finished: "집중시간이 종료되었습니다.",
  break: "휴식 시간입니다.",
  paused: "일시 정지",
  noSubject: "무엇에 집중할지 정해주세요.",
  maxFocusMinutes:
    "집중의 효율을 높이기 위해서는 60분 집중 후 쉬는 시간을 갖는 것이 좋습니다.",
  focus: (subjectName) => `${subjectName}에 집중하는 시간입니다.`,
  focusGeneric: "집중하는 시간입니다.",
};

function Timer({
  formattedTime,
  timerMode,
  isTimerFinished,
  focusMinutesMessage,
  selectedSubject,
  onChangeSubject,
  subjects,
  focusMinutes,
  onChangeFocusMinutes,
  isRunning,
  secondsLeft,
  focusSeconds,
  hasSelectedSubject,
  onStart,
  onPause,
  onSaveAndReset,
  onReset,
}) {
  let statusMessage = TIMER_MESSAGES.idle;

  if (focusMinutesMessage) {
    statusMessage = TIMER_MESSAGES.maxFocusMinutes;
  } else if (!hasSelectedSubject) {
    statusMessage = TIMER_MESSAGES.noSubject;
  } else if (isTimerFinished) {
    statusMessage = TIMER_MESSAGES.finished;
  } else if (timerMode === "break") {
    statusMessage = TIMER_MESSAGES.break;
  } else if (isRunning && selectedSubject) {
    const subject = subjects.find(
      (item) => item.id === Number(selectedSubject),
    );

    statusMessage = subject
      ? TIMER_MESSAGES.focus(subject.name)
      : TIMER_MESSAGES.focusGeneric;
  } else if (!isRunning && secondsLeft !== focusSeconds) {
    statusMessage = TIMER_MESSAGES.paused;
  }

  return (
    <section>
      <h2>Timer</h2>

      <div className="timer-settings">
        <div className="timer-subject">
          <label>
            Subject
            <select
              value={selectedSubject}
              onChange={(event) => onChangeSubject(event.target.value)}
            >
              <option value="">Choose subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="timer-focus">
          <label>
            Focus minutes
            <input
              type="number"
              min="1"
              value={focusMinutes}
              onChange={onChangeFocusMinutes}
              disabled={isRunning}
            />
          </label>
        </div>
      </div>

      <div className="timer-status">
        <span>{statusMessage}</span>
      </div>

      <h2 className="timer-display">{formattedTime}</h2>

      <div className="timer-controls">
        {isRunning ? (
          <button onClick={onPause}>
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
              className="lucide lucide-pause-icon lucide-pause"
            >
              <rect x="14" y="3" width="5" height="18" rx="1" />
              <rect x="5" y="3" width="5" height="18" rx="1" />
            </svg>
          </button>
        ) : (
          <button
            onClick={onStart}
            disabled={secondsLeft === 0 || !hasSelectedSubject}
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
              className="lucide lucide-play-icon lucide-play"
            >
              <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
            </svg>
          </button>
        )}

        <button
          onClick={onSaveAndReset}
          disabled={secondsLeft === focusSeconds}
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
            className="lucide lucide-bookmark-icon lucide-bookmark"
          >
            <path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z" />
          </svg>
        </button>

        <button onClick={onReset}>
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
            className="lucide lucide-rotate-ccw-icon lucide-rotate-ccw"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
    </section>
  );
}

export default Timer;
