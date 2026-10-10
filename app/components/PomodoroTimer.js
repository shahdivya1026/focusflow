"use client";

import { useEffect, useRef, useState } from "react";

export default function PomodoroTimer({ onSessionSaved }) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [saving, setSaving] = useState(false);

  const sessionSecondsRef = useRef(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds((currentSeconds) => {
        const newSeconds = currentSeconds + 1;

        sessionSecondsRef.current = newSeconds;

        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  function startTimer() {
    if (!startTime) {
      setStartTime(new Date().toISOString());
    }

    setIsRunning(true);
  }

  function pauseTimer() {
    setIsRunning(false);
  }

  async function saveSession() {
    if (!startTime || sessionSecondsRef.current <= 0) {
      return;
    }

    setSaving(true);

    try {
      const endTime = new Date();

      const response = await fetch("/api/focus-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startTime: startTime,
          endTime: endTime.toISOString(),
          duration: sessionSecondsRef.current,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Failed to save focus session:",
          data.error
        );

        return;
      }

      if (onSessionSaved) {
        onSessionSaved();
      }
    } catch (error) {
      console.error(
        "Failed to save focus session:",
        error
      );
    } finally {
      setSaving(false);
    }
  }

  async function resetTimer() {
    if (sessionSecondsRef.current > 0 && startTime) {
      await saveSession();
    }

    setIsRunning(false);
    setSeconds(0);
    setStartTime(null);
    sessionSecondsRef.current = 0;
  }

  function formatTime() {
    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    const remainingSeconds = seconds % 60;

    return (
      String(hours).padStart(2, "0") +
      ":" +
      String(minutes).padStart(2, "0") +
      ":" +
      String(remainingSeconds).padStart(2, "0")
    );
  }

  return (
    <div className="pomodoro-timer-card">
      <div className="pomodoro-timer-label">
        FOCUS TIMER
      </div>

      <div className="pomodoro-timer-display">
        {formatTime()}
      </div>

      <p className="pomodoro-timer-status">
        {saving
          ? "Saving your focus session..."
          : isRunning
          ? "Focus session is running"
          : seconds > 0
          ? "Focus session paused"
          : "Ready to focus"}
      </p>

      <div className="pomodoro-timer-actions">
        {!isRunning && (
          <button
            type="button"
            onClick={startTimer}
            className="pomodoro-start-button"
            disabled={saving}
          >
            ▶ {seconds > 0 ? "Resume" : "Start"}
          </button>
        )}

        {isRunning && (
          <button
            type="button"
            onClick={pauseTimer}
            className="pomodoro-pause-button"
          >
            ⏸ Pause
          </button>
        )}

        <button
          type="button"
          onClick={resetTimer}
          className="pomodoro-reset-button"
          disabled={saving}
        >
          ↻ Stop & Save
        </button>
      </div>

      <p className="pomodoro-timer-hint">
        Focus for as long as you need. Stop whenever you're
        done.
      </p>
    </div>
  );
}