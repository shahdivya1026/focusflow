"use client";

import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import AuthGuard from "../components/AuthGuard";

export default function ProductivityPage() {
  const [tasks, setTasks] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPiePart, setSelectedPiePart] = useState(null);

  useEffect(() => {
    async function loadProductivityData() {
      try {
        const [tasksResponse, focusResponse] =
          await Promise.all([
            fetch("/api/tasks"),
            fetch("/api/focus-sessions"),
          ]);

        if (tasksResponse.ok) {
          const taskData = await tasksResponse.json();
          setTasks(taskData);
        }

        if (focusResponse.ok) {
          const focusData = await focusResponse.json();
          setFocusSessions(focusData);
        }
      } catch (error) {
        console.error(
          "Failed to load productivity data:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadProductivityData();
  }, []);

  /* =========================================
     BASIC DATA
  ========================================= */

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks =
    totalTasks - completedTasks;

  const totalFocusMinutes =
    focusSessions.reduce(
      (total, session) =>
        total + Number(session.duration || 0),
      0
    );

  function formatFocusTime(minutes) {
    const safeMinutes = Math.max(
      0,
      Math.round(Number(minutes || 0))
    );

    const hours = Math.floor(
      safeMinutes / 60
    );

    const mins = safeMinutes % 60;

    if (hours === 0) {
      return `${mins}m`;
    }

    if (mins === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${mins}m`;
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "—";
    }

    return new Date(
      dateValue
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateShort(dateValue) {
    if (!dateValue) {
      return "—";
    }

    return new Date(
      dateValue
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  }

  function formatTime(dateValue) {
    if (!dateValue) {
      return "—";
    }

    return new Date(
      dateValue
    ).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getDateKey(dateValue) {
    const date = new Date(dateValue);

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function dateFromKey(key) {
    const [year, month, day] =
      key.split("-").map(Number);

    return new Date(
      year,
      month - 1,
      day
    );
  }

  function addDays(date, amount) {
    const result = new Date(date);

    result.setDate(
      result.getDate() + amount
    );

    return result;
  }

  /* =========================================
     TODAY
  ========================================= */

  const today = new Date();

  const todayKey =
    getDateKey(today);

  /* =========================================
     DAILY ACTIVITY
  ========================================= */

  const dailyActivity = {};

  focusSessions.forEach((session) => {
    if (!session.startTime) {
      return;
    }

    const key =
      getDateKey(session.startTime);

    if (!dailyActivity[key]) {
      dailyActivity[key] = {
        date: key,
        sessions: 0,
        minutes: 0,
      };
    }

    dailyActivity[key].sessions += 1;

    dailyActivity[key].minutes +=
      Number(session.duration || 0);
  });

  /* =========================================
     HEATMAP
  ========================================= */

  const heatmapDays = [];

  for (let i = 29; i >= 0; i--) {
    const date = addDays(today, -i);

    const key = getDateKey(date);

    heatmapDays.push({
      key,
      date,
      sessions:
        dailyActivity[key]?.sessions || 0,
      minutes:
        dailyActivity[key]?.minutes || 0,
    });
  }

  function getHeatmapLevel(minutes) {
    if (minutes === 0) {
      return 0;
    }

    if (minutes < 30) {
      return 1;
    }

    if (minutes < 60) {
      return 2;
    }

    if (minutes < 120) {
      return 3;
    }

    return 4;
  }

  /* =========================================
     CURRENT STREAK
  ========================================= */

  let currentStreak = 0;

  let streakDate = new Date(today);

  while (true) {
    const key =
      getDateKey(streakDate);

    if (
      dailyActivity[key] &&
      dailyActivity[key].minutes > 0
    ) {
      currentStreak += 1;

      streakDate = addDays(
        streakDate,
        -1
      );
    } else {
      break;
    }
  }

  /* =========================================
     LONGEST STREAK
  ========================================= */

  const activeDates = Object.keys(
    dailyActivity
  )
    .filter(
      (key) =>
        dailyActivity[key].minutes > 0
    )
    .sort();

  let longestStreak = 0;

  let longestStreakStart = null;

  let longestStreakEnd = null;

  let streakLength = 0;

  let streakStart = null;

  let previousDate = null;

  activeDates.forEach((key) => {
    const currentDate =
      dateFromKey(key);

    if (!previousDate) {
      streakLength = 1;
      streakStart = currentDate;
    } else {
      const difference = Math.round(
        (currentDate -
          previousDate) /
          (1000 * 60 * 60 * 24)
      );

      if (difference === 1) {
        streakLength += 1;
      } else {
        streakLength = 1;
        streakStart = currentDate;
      }
    }

    if (
      streakLength >
      longestStreak
    ) {
      longestStreak =
        streakLength;

      longestStreakStart =
        new Date(streakStart);

      longestStreakEnd =
        new Date(currentDate);
    }

    previousDate = currentDate;
  });

  /* =========================================
     LONGEST FOCUS SESSION
  ========================================= */

  let longestFocusSession = null;

  if (focusSessions.length > 0) {
    longestFocusSession =
      focusSessions.reduce(
        (longest, session) => {
          if (
            !longest ||
            Number(
              session.duration || 0
            ) >
              Number(
                longest.duration || 0
              )
          ) {
            return session;
          }

          return longest;
        },
        null
      );
  }

  /* =========================================
     MOST PRODUCTIVE DAY
  ========================================= */

  let mostProductiveDay = null;

  Object.values(
    dailyActivity
  ).forEach((day) => {
    if (
      !mostProductiveDay ||
      day.minutes >
        mostProductiveDay.minutes
    ) {
      mostProductiveDay = day;
    }
  });

  /* =========================================
     PRODUCTIVITY SCORE
  ========================================= */

  let productivityScore = 0;

  if (totalTasks > 0) {
    productivityScore +=
      (completedTasks /
        totalTasks) *
      50;
  }

  if (totalFocusMinutes > 0) {
    productivityScore += 25;
  }

  if (focusSessions.length > 0) {
    productivityScore += 25;
  }

  productivityScore = Math.min(
    Math.round(productivityScore),
    100
  );

  /* =========================================
     TOTAL FOCUS TIME
  ========================================= */

  const totalFocusHours =
    Math.floor(
      totalFocusMinutes / 60
    );

  const remainingFocusMinutes =
    totalFocusMinutes % 60;

  /* =========================================
     CURRENT WEEK
  ========================================= */

  function getStartOfWeek(date) {
    const result = new Date(date);

    const day =
      result.getDay();

    const difference =
      day === 0 ? 6 : day - 1;

    result.setDate(
      result.getDate() -
        difference
    );

    result.setHours(
      0,
      0,
      0,
      0
    );

    return result;
  }

  const weekStart =
    getStartOfWeek(today);

  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    weekDays.push(
      addDays(
        weekStart,
        i
      )
    );
  }

  /* =========================================
     WEEKLY PRODUCTIVITY
  ========================================= */

  const weeklyData =
    weekDays.map((date) => {
      const key =
        getDateKey(date);

      const dayActivity =
        dailyActivity[key];

      const taskCount =
        tasks.filter((task) => {
          if (!task.completed) {
            return false;
          }

          const taskDate =
            task.endDate ||
            task.startDate ||
            task.createdAt;

          if (!taskDate) {
            return false;
          }

          return (
            getDateKey(
              taskDate
            ) === key
          );
        }).length;

      return {
        date,
        key,
        minutes:
          dayActivity?.minutes ||
          0,
        sessions:
          dayActivity?.sessions ||
          0,
        completedTasks:
          taskCount,
      };
    });

  const maximumWeeklyMinutes =
    Math.max(
      ...weeklyData.map(
        (day) => day.minutes
      ),
      1
    );

  const weeklyFocusMinutes =
    weeklyData.reduce(
      (total, day) =>
        total + day.minutes,
      0
    );

  const weeklyCompletedTasks =
    weeklyData.reduce(
      (total, day) =>
        total +
        day.completedTasks,
      0
    );

  const weeklySessions =
    weeklyData.reduce(
      (total, day) =>
        total + day.sessions,
      0
    );

  /* =========================================
     PEAK PRODUCTIVITY HOURS
  ========================================= */

  const hourlyActivity =
    {};

  for (let hour = 0; hour < 24; hour++) {
    hourlyActivity[hour] = 0;
  }

  focusSessions.forEach(
    (session) => {
      if (!session.startTime) {
        return;
      }

      const hour =
        new Date(
          session.startTime
        ).getHours();

      hourlyActivity[hour] +=
        Number(
          session.duration || 0
        );
    }
  );

  const peakHours = Object.entries(
    hourlyActivity
  )
    .map(([hour, minutes]) => ({
      hour: Number(hour),
      minutes,
    }))
    .sort(
      (a, b) =>
        b.minutes - a.minutes
    )
    .slice(0, 4);

  const maximumPeakMinutes =
    Math.max(
      ...peakHours.map(
        (item) => item.minutes
      ),
      1
    );

  function formatHour(hour) {
    const period =
      hour >= 12
        ? "PM"
        : "AM";

    const displayHour =
      hour % 12 || 12;

    return `${displayHour}:00 ${period}`;
  }

  function formatHourRange(hour) {
    const nextHour =
      (hour + 1) % 24;

    return `${formatHour(
      hour
    )} – ${formatHour(
      nextHour
    )}`;
  }

  /* =========================================
     PIE CHART
     FOCUS BY TIME OF DAY
  ========================================= */

  const pieData = [
    {
      name: "Morning",
      emoji: "🌅",
      minutes: 0,
    },
    {
      name: "Afternoon",
      emoji: "☀️",
      minutes: 0,
    },
    {
      name: "Evening",
      emoji: "🌇",
      minutes: 0,
    },
    {
      name: "Night",
      emoji: "🌙",
      minutes: 0,
    },
  ];

  focusSessions.forEach(
    (session) => {
      if (!session.startTime) {
        return;
      }

      const hour =
        new Date(
          session.startTime
        ).getHours();

      const minutes =
        Number(
          session.duration || 0
        );

      if (hour >= 5 && hour < 12) {
        pieData[0].minutes +=
          minutes;
      } else if (
        hour >= 12 &&
        hour < 17
      ) {
        pieData[1].minutes +=
          minutes;
      } else if (
        hour >= 17 &&
        hour < 21
      ) {
        pieData[2].minutes +=
          minutes;
      } else {
        pieData[3].minutes +=
          minutes;
      }
    }
  );

  const pieTotal = pieData.reduce(
    (total, item) =>
      total + item.minutes,
    0
  );

  let currentDegree = 0;

  const pieColors = [
    "#c98273",
    "#d9b8ad",
    "#9f6358",
    "#eadbd6",
  ];

  const pieSegments =
    pieData.map(
      (item, index) => {
        const percentage =
          pieTotal > 0
            ? (item.minutes /
                pieTotal) *
              100
            : 0;

        const startDegree =
          currentDegree;

        const endDegree =
          currentDegree +
          (percentage * 3.6);

        currentDegree =
          endDegree;

        return {
          ...item,
          percentage,
          startDegree,
          endDegree,
          color:
            pieColors[index],
        };
      }
    );

  const pieGradient =
    pieTotal > 0
      ? `conic-gradient(${pieSegments
          .map(
            (segment) =>
              `${segment.color} ${segment.startDegree}deg ${segment.endDegree}deg`
          )
          .join(", ")})`
      : "conic-gradient(#eadbd6 0deg 360deg)";

  /* =========================================
     WEEKLY GOALS
  ========================================= */

  const focusGoalMinutes =
    10 * 60;

  const taskGoal = 20;

  const streakGoal = 7;

  const focusGoalPercentage =
    Math.min(
      Math.round(
        (weeklyFocusMinutes /
          focusGoalMinutes) *
          100
      ),
      100
    );

  const taskGoalPercentage =
    Math.min(
      Math.round(
        (weeklyCompletedTasks /
          taskGoal) *
          100
      ),
      100
    );

  const streakGoalPercentage =
    Math.min(
      Math.round(
        (currentStreak /
          streakGoal) *
          100
      ),
      100
    );

  /* =========================================
     TODAY TIMELINE
  ========================================= */

  const todaySessions =
    focusSessions
      .filter(
        (session) =>
          session.startTime &&
          getDateKey(
            session.startTime
          ) === todayKey
      )
      .sort(
        (a, b) =>
          new Date(
            a.startTime
          ) -
          new Date(
            b.startTime
          )
      );

  /* =========================================
     PRODUCTIVITY INSIGHT
  ========================================= */

  let insightText =
    "Start a focus session today and begin building your productivity history.";

  if (
    totalFocusMinutes > 0 &&
    completedTasks > 0
  ) {
    insightText = `You've completed ${completedTasks} task${
      completedTasks === 1
        ? ""
        : "s"
    } and focused for ${formatFocusTime(
      totalFocusMinutes
    )}. Keep the momentum going! 🚀`;
  } else if (
    totalFocusMinutes > 0
  ) {
    insightText = `You've logged ${formatFocusTime(
      totalFocusMinutes
    )} of focus time. Try pairing your next focus session with a task completion. 🎯`;
  } else if (
    completedTasks > 0
  ) {
    insightText = `You've completed ${completedTasks} task${
      completedTasks === 1
        ? ""
        : "s"
    }. Add a focus session to start tracking your deep-work habits. 🧠`;
  }

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <AuthGuard>
        <main>
          <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-content">
              <Header />

              <div className="productivity-page">
                <div className="productivity-loading">
                  🧠 Loading your productivity...
                </div>
              </div>
            </div>
          </div>
        </main>
      </AuthGuard>
    );
  }

  /* =========================================
     PAGE
  ========================================= */

  return (
    <AuthGuard>
      <main>
        <div className="dashboard-layout">

          <Sidebar />

          <div className="dashboard-content">

            <Header />

            <div className="productivity-page">

              {/* =================================
                  PAGE HEADING
              ================================= */}

              <div className="productivity-heading">
                <p className="productivity-label">
                  YOUR PERFORMANCE
                </p>

                <h2>
                  🧠 Productivity Center
                </h2>

                <p>
                  Understand your focus,
                  habits and progress at a
                  glance. ✨
                </p>
              </div>


              {/* =================================
                  PRODUCTIVITY SCORE
              ================================= */}

              <section className="productivity-score-card">

                <div className="score-content">

                  <div>
                    <p className="score-label">
                      PRODUCTIVITY SCORE
                    </p>

                    <h1>
                      {productivityScore}
                    </h1>

                    <p className="score-message">
                      {productivityScore >=
                      80
                        ? "🔥 You're on fire! Keep going."
                        : productivityScore >=
                          50
                        ? "✨ Good progress! Keep building."
                        : "🌱 Every focused session counts."}
                    </p>
                  </div>

                  <div className="score-circle">
                    <span>
                      {productivityScore}%
                    </span>
                  </div>

                </div>


                <div className="score-stats">

                  <div>
                    <span>🔥</span>

                    <strong>
                      {currentStreak} days
                    </strong>

                    <small>
                      Current Streak
                    </small>
                  </div>

                  <div>
                    <span>⏱️</span>

                    <strong>
                      {formatFocusTime(
                        totalFocusMinutes
                      )}
                    </strong>

                    <small>
                      Total Focus Time
                    </small>
                  </div>

                  <div>
                    <span>✅</span>

                    <strong>
                      {completedTasks}
                    </strong>

                    <small>
                      Completed Tasks
                    </small>
                  </div>

                </div>

              </section>


              {/* =================================
                  HEATMAP + PIE CHART
              ================================= */}

              <div className="productivity-grid">

                {/* HEATMAP */}

                <section className="productivity-card">

                  <div className="card-heading">

                    <div>
                      <h3>
                        🔥 Active Heatmap
                      </h3>

                      <p>
                        Your last 30 days
                      </p>
                    </div>

                  </div>

                  <div className="real-heatmap">

                    {heatmapDays.map(
                      (day) => (
                        <div
                          key={day.key}
                          className={`heatmap-cell level-${getHeatmapLevel(
                            day.minutes
                          )}`}
                          title={`${formatDate(
                            day.date
                          )} • ${
                            day.sessions
                          } sessions • ${formatFocusTime(
                            day.minutes
                          )}`}
                        ></div>
                      )
                    )}

                  </div>

                  <div className="heatmap-footer">

                    <span>
                      Less
                    </span>

                    <div className="heatmap-legend">

                      <span className="level-0"></span>
                      <span className="level-1"></span>
                      <span className="level-2"></span>
                      <span className="level-3"></span>
                      <span className="level-4"></span>

                    </div>

                    <span>
                      More
                    </span>

                  </div>

                </section>


                {/* PIE CHART */}

                <section className="productivity-card">

                  <div className="card-heading">

                    <div>
                      <h3>
                        🥧 Focus Distribution
                      </h3>

                      <p>
                        Focus time by time of day
                      </p>
                    </div>

                  </div>

                  <div className="pie-chart-area">

                    <div
                      className="real-pie-chart"
                      style={{
                        background:
                          pieGradient,
                      }}
                    >
                      <div className="pie-chart-inner">
                        <strong>
                          {formatFocusTime(
                            pieTotal
                          )}
                        </strong>

                        <span>
                          total focus
                        </span>
                      </div>
                    </div>


                    <div className="pie-legend">

                      {pieSegments.map(
                        (segment) => (
                          <button
                            key={
                              segment.name
                            }
                            type="button"
                            className={`pie-legend-item ${
                              selectedPiePart ===
                              segment.name
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              setSelectedPiePart(
                                segment.name
                              )
                            }
                          >

                            <span
                              className="pie-dot"
                              style={{
                                background:
                                  segment.color,
                              }}
                            ></span>

                            <span className="pie-legend-text">
                              {segment.emoji}{" "}
                              {segment.name}
                            </span>

                            <strong>
                              {Math.round(
                                segment.percentage
                              )}
                              %
                            </strong>

                          </button>
                        )
                      )}

                    </div>

                  </div>

                  {selectedPiePart && (
                    <div className="pie-selected-info">

                      <strong>
                        {
                          pieData.find(
                            (item) =>
                              item.name ===
                              selectedPiePart
                          )?.emoji
                        }{" "}
                        {selectedPiePart}
                      </strong>

                      <span>
                        {formatFocusTime(
                          pieData.find(
                            (item) =>
                              item.name ===
                              selectedPiePart
                          )?.minutes || 0
                        )}{" "}
                        of your focus time
                      </span>

                    </div>
                  )}

                </section>

              </div>


              {/* =================================
                  WEEKLY CHART + PEAK HOURS
              ================================= */}

              <div className="productivity-grid">

                {/* WEEKLY CHART */}

                <section className="productivity-card">

                  <div className="card-heading">

                    <div>
                      <h3>
                        📊 Weekly Productivity
                      </h3>

                      <p>
                        Focus time over the current week
                      </p>
                    </div>

                    <strong className="chart-total">
                      {formatFocusTime(
                        weeklyFocusMinutes
                      )}
                    </strong>

                  </div>

                  <div className="weekly-chart">

                    {weeklyData.map(
                      (day) => {
                        const height =
                          day.minutes > 0
                            ? Math.max(
                                (day.minutes /
                                  maximumWeeklyMinutes) *
                                  100,
                                8
                              )
                            : 3;

                        const isToday =
                          day.key ===
                          todayKey;

                        return (
                          <div
                            key={day.key}
                            className={`weekly-bar-column ${
                              isToday
                                ? "today"
                                : ""
                            }`}
                          >

                            <span className="weekly-bar-value">
                              {day.minutes > 0
                                ? formatFocusTime(
                                    day.minutes
                                  )
                                : ""}
                            </span>

                            <div className="weekly-bar-wrapper">

                              <div
                                className="weekly-bar"
                                style={{
                                  height:
                                    `${height}%`,
                                }}
                                title={`${formatDate(
                                  day.date
                                )} • ${formatFocusTime(
                                  day.minutes
                                )}`}
                              ></div>

                            </div>

                            <span className="weekly-bar-day">
                              {day.date.toLocaleDateString(
                                "en-IN",
                                {
                                  weekday:
                                    "short",
                                }
                              )}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>

                  <div className="weekly-chart-summary">

                    <span>
                      🎯{" "}
                      {weeklySessions} sessions
                    </span>

                    <span>
                      ✅{" "}
                      {weeklyCompletedTasks} completed tasks
                    </span>

                  </div>

                </section>


                {/* PEAK HOURS */}

                <section className="productivity-card">

                  <div className="card-heading">

                    <div>
                      <h3>
                        ⏰ Peak Productivity
                      </h3>

                      <p>
                        When you focus the most
                      </p>
                    </div>

                  </div>

                  {peakHours.length === 0 ? (
                    <div className="empty-productivity-box">
                      <span>🕐</span>

                      <p>
                        Complete a focus session
                        to discover your peak hours.
                      </p>
                    </div>
                  ) : (
                    <div className="peak-hours">

                      {peakHours.map(
                        (item, index) => {

                          const percentage =
                            item.minutes >
                            0
                              ? Math.max(
                                  Math.round(
                                    (item.minutes /
                                      maximumPeakMinutes) *
                                      100
                                  ),
                                  8
                                )
                              : 0;

                          return (
                            <div
                              key={
                                item.hour
                              }
                              className="peak-hour-row"
                            >

                              <span>
                                {index === 0
                                  ? "🏆"
                                  : index ===
                                    1
                                  ? "🥈"
                                  : index ===
                                    2
                                  ? "🥉"
                                  : "⭐"}{" "}
                                {formatHourRange(
                                  item.hour
                                )}
                              </span>

                              <div>

                                <div className="progress-bar">

                                  <div
                                    className="progress-fill"
                                    style={{
                                      width:
                                        `${percentage}%`,
                                    }}
                                  ></div>

                                </div>

                                <small>
                                  {formatFocusTime(
                                    item.minutes
                                  )}
                                </small>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>
                  )}

                </section>

              </div>


              {/* =================================
                  PERSONAL RECORDS
              ================================= */}

              <section className="productivity-card records-card">

                <div className="card-heading">

                  <div>
                    <h3>
                      🏆 Personal Records
                    </h3>

                    <p>
                      Your productivity milestones
                    </p>
                  </div>

                </div>


                <div className="records-grid">

                  {/* LONGEST FOCUS */}

                  <div className="record-item">

                    <span>
                      ⏱️
                    </span>

                    <h4>
                      Longest Focus Period
                    </h4>

                    <strong>
                      {longestFocusSession
                        ? formatFocusTime(
                            longestFocusSession.duration
                          )
                        : "—"}
                    </strong>

                    <p>
                      {longestFocusSession
                        ? `${formatDate(
                            longestFocusSession.startTime
                          )} • ${formatTime(
                            longestFocusSession.startTime
                          )}`
                        : "No focus session yet"}
                    </p>

                  </div>


                  {/* MOST FOCUSED SESSION */}

                  <div className="record-item">

                    <span>
                      🎯
                    </span>

                    <h4>
                      Most Focused Session
                    </h4>

                    <strong>
                      {longestFocusSession
                        ? formatFocusTime(
                            longestFocusSession.duration
                          )
                        : "—"}
                    </strong>

                    <p>
                      {longestFocusSession
                        ? `Session on ${formatDate(
                            longestFocusSession.startTime
                          )}`
                        : "No session recorded"}
                    </p>

                  </div>


                  {/* MOST PRODUCTIVE DAY */}

                  <div className="record-item">

                    <span>
                      🚀
                    </span>

                    <h4>
                      Most Productive Day
                    </h4>

                    <strong>
                      {mostProductiveDay
                        ? `${mostProductiveDay.sessions} sessions`
                        : "—"}
                    </strong>

                    <p>
                      {mostProductiveDay
                        ? `${formatDate(
                            dateFromKey(
                              mostProductiveDay.date
                            )
                          )} • ${formatFocusTime(
                            mostProductiveDay.minutes
                          )}`
                        : "No activity yet"}
                    </p>

                  </div>


                  {/* LONGEST STREAK */}

                  <div className="record-item">

                    <span>
                      🔥
                    </span>

                    <h4>
                      Longest Streak
                    </h4>

                    <strong>
                      {longestStreak} days
                    </strong>

                    <p>
                      {longestStreakStart &&
                      longestStreakEnd
                        ? `${formatDateShort(
                            longestStreakStart
                          )} → ${formatDateShort(
                            longestStreakEnd
                          )}`
                        : "No streak yet"}
                    </p>

                  </div>

                </div>

              </section>


              {/* =================================
                  WEEKLY GOALS
              ================================= */}

              <section className="productivity-card">

                <div className="card-heading">

                  <div>
                    <h3>
                      🎯 Weekly Goals
                    </h3>

                    <p>
                      Your progress this week
                    </p>
                  </div>

                </div>


                <div className="goals-list">

                  {/* FOCUS GOAL */}

                  <div className="goal-item">

                    <div className="goal-top">

                      <span>
                        🧠 Focus for 10 hours
                      </span>

                      <strong>
                        {formatFocusTime(
                          weeklyFocusMinutes
                        )}{" "}
                        / 10h
                      </strong>

                    </div>

                    <div className="goal-progress">

                      <div
                        style={{
                          width:
                            `${focusGoalPercentage}%`,
                        }}
                      ></div>

                    </div>

                  </div>


                  {/* TASK GOAL */}

                  <div className="goal-item">

                    <div className="goal-top">

                      <span>
                        ✅ Complete 20 tasks
                      </span>

                      <strong>
                        {weeklyCompletedTasks} /{" "}
                        {taskGoal}
                      </strong>

                    </div>

                    <div className="goal-progress">

                      <div
                        style={{
                          width:
                            `${taskGoalPercentage}%`,
                        }}
                      ></div>

                    </div>

                  </div>


                  {/* STREAK GOAL */}

                  <div className="goal-item">

                    <div className="goal-top">

                      <span>
                        🔥 Maintain a 7-day streak
                      </span>

                      <strong>
                        {currentStreak} /{" "}
                        {streakGoal} days
                      </strong>

                    </div>

                    <div className="goal-progress">

                      <div
                        style={{
                          width:
                            `${streakGoalPercentage}%`,
                        }}
                      ></div>

                    </div>

                  </div>

                </div>

              </section>


              {/* =================================
                  TODAY'S TIMELINE
              ================================= */}

              <section className="productivity-card">

                <div className="card-heading">

                  <div>
                    <h3>
                      🕐 Today's Productivity Timeline
                    </h3>

                    <p>
                      Your focus sessions today
                    </p>
                  </div>

                  <strong className="chart-total">
                    {formatFocusTime(
                      todaySessions.reduce(
                        (total, session) =>
                          total +
                          Number(
                            session.duration ||
                              0
                          ),
                        0
                      )
                    )}
                  </strong>

                </div>


                {todaySessions.length === 0 ? (

                  <div className="timeline-empty">

                    <span>
                      🌱
                    </span>

                    <p>
                      No focus sessions today yet.
                    </p>

                    <small>
                      Start a session to build your timeline.
                    </small>

                  </div>

                ) : (

                  <div className="productivity-timeline">

                    {todaySessions.map(
                      (session, index) => (
                        <div
                          key={
                            session.id ||
                            index
                          }
                          className="timeline-session"
                        >

                          <div className="timeline-dot">
                            🧠
                          </div>

                          <div className="timeline-line-content">

                            <div className="timeline-session-top">

                              <strong>
                                Focus Session
                              </strong>

                              <span>
                                {formatTime(
                                  session.startTime
                                )}
                              </span>

                            </div>

                            <p>
                              {formatFocusTime(
                                session.duration
                              )}{" "}
                              focused
                            </p>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                )}

              </section>


              {/* =================================
                  SMART INSIGHT
              ================================= */}

              <section className="productivity-insight">

                <div className="insight-icon">
                  💡
                </div>

                <div>

                  <p className="insight-label">
                    SMART PRODUCTIVITY INSIGHT
                  </p>

                  <h3>
                    {peakHours.length > 0
                      ? `Your strongest focus window is around ${formatHour(
                          peakHours[0].hour
                        )}.`
                      : "Your productivity journey starts here."}
                  </h3>

                  <p>
                    {insightText}
                  </p>

                </div>

              </section>


              {/* =================================
                  WEEKLY SUMMARY
              ================================= */}

              <section className="productivity-card weekly-summary">

                <div className="card-heading">

                  <div>
                    <h3>
                      📋 Weekly Productivity Summary
                    </h3>

                    <p>
                      Current week at a glance
                    </p>
                  </div>

                </div>


                <div className="summary-grid">

                  <div>
                    <span>
                      ⏱️
                    </span>

                    <strong>
                      {formatFocusTime(
                        weeklyFocusMinutes
                      )}
                    </strong>

                    <small>
                      Focus this week
                    </small>
                  </div>


                  <div>
                    <span>
                      🎯
                    </span>

                    <strong>
                      {weeklyCompletedTasks}
                    </strong>

                    <small>
                      Tasks completed
                    </small>
                  </div>


                  <div>
                    <span>
                      🧠
                    </span>

                    <strong>
                      {weeklySessions}
                    </strong>

                    <small>
                      Focus sessions
                    </small>
                  </div>


                  <div>
                    <span>
                      🔥
                    </span>

                    <strong>
                      {currentStreak} days
                    </strong>

                    <small>
                      Current streak
                    </small>
                  </div>

                </div>

              </section>

            </div>

          </div>

        </div>
      </main>
    </AuthGuard>
  );
}