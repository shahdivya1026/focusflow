"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import AuthGuard from "../components/AuthGuard";
import PomodoroTimer from "../components/PomodoroTimer";

export default function PomodoroPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch("/api/focus-sessions");

      const data = await response.json();

      if (response.ok) {
        setSessions(data);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error(
        "Failed to fetch focus sessions:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  function formatDuration(totalSeconds) {
    const seconds = Number(totalSeconds) || 0;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(
      (seconds % 3600) / 60
    );
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return (
        hours +
        "h " +
        String(minutes).padStart(2, "0") +
        "m " +
        String(remainingSeconds).padStart(2, "0") +
        "s"
      );
    }

    if (minutes > 0) {
      return (
        minutes +
        "m " +
        String(remainingSeconds).padStart(2, "0") +
        "s"
      );
    }

    return remainingSeconds + "s";
  }

  function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(dateString) {
    const date = new Date(dateString);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function isToday(dateString) {
    const sessionDate = new Date(dateString);
    const today = new Date();

    return (
      sessionDate.getFullYear() === today.getFullYear() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getDate() === today.getDate()
    );
  }

  function getStartOfWeek() {
    const today = new Date();

    const day = today.getDay();
    const difference = day === 0 ? 6 : day - 1;

    const startOfWeek = new Date(today);

    startOfWeek.setDate(
      today.getDate() - difference
    );

    startOfWeek.setHours(0, 0, 0, 0);

    return startOfWeek;
  }

  const todayFocusSeconds = sessions
    .filter((session) => isToday(session.startTime))
    .reduce(
      (total, session) =>
        total + Number(session.duration),
      0
    );

  const startOfWeek = getStartOfWeek();

  const weeklyFocusSeconds = sessions
    .filter((session) => {
      const sessionDate = new Date(
        session.startTime
      );

      return sessionDate >= startOfWeek;
    })
    .reduce(
      (total, session) =>
        total + Number(session.duration),
      0
    );

  const totalFocusSeconds = sessions.reduce(
    (total, session) =>
      total + Number(session.duration),
    0
  );

  return (
    <AuthGuard>
      <main>
        <div className="dashboard-layout">
          <Sidebar />

          <div className="dashboard-content">
            <Header />

            <div className="focus-history-page">
              <div className="focus-history-header">
                <div>
                  <p className="focus-history-label">
                    FOCUS & PRODUCTIVITY
                  </p>

                  <h1>Focus History</h1>

                  <p>
                    Track your focus sessions and see how
                    much time you have spent being
                    productive.
                  </p>
                </div>
              </div>

              <PomodoroTimer
                onSessionSaved={fetchSessions}
              />

              <div className="focus-summary-grid">
                <div className="focus-summary-card">
                  <span>Today's Focus</span>

                  <strong>
                    {formatDuration(
                      todayFocusSeconds
                    )}
                  </strong>
                </div>

                <div className="focus-summary-card">
                  <span>This Week</span>

                  <strong>
                    {formatDuration(
                      weeklyFocusSeconds
                    )}
                  </strong>
                </div>

                <div className="focus-summary-card">
                  <span>Total Focus Time</span>

                  <strong>
                    {formatDuration(
                      totalFocusSeconds
                    )}
                  </strong>
                </div>
              </div>

              <div className="focus-history-section">
                <div className="focus-history-title">
                  <div>
                    <h2>Focus Sessions</h2>

                    <p>
                      {sessions.length}{" "}
                      {sessions.length === 1
                        ? "session"
                        : "sessions"}{" "}
                      recorded
                    </p>
                  </div>
                </div>

                {loading ? (
                  <p className="focus-empty-message">
                    Loading focus history...
                  </p>
                ) : sessions.length === 0 ? (
                  <p className="focus-empty-message">
                    No focus sessions yet. Start a focus
                    session using the timer above.
                  </p>
                ) : (
                  <div className="focus-table-container">
                    <table className="focus-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Start Time</th>
                          <th>End Time</th>
                          <th>Total Time</th>
                        </tr>
                      </thead>

                      <tbody>
                        {sessions.map((session) => (
                          <tr key={session.id}>
                            <td>
                              {formatDate(
                                session.startTime
                              )}
                            </td>

                            <td>
                              {formatTime(
                                session.startTime
                              )}
                            </td>

                            <td>
                              {formatTime(
                                session.endTime
                              )}
                            </td>

                            <td className="focus-duration">
                              {formatDuration(
                                session.duration
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}