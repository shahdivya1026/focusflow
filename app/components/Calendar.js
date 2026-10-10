"use client";

import { useEffect, useRef, useState } from "react";

export default function Calendar({ dashboardOnly = false }) {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(
    today.getDate()
  );

  const [events, setEvents] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("Note");
  const [eventTime, setEventTime] = useState("");

  const [activeReminder, setActiveReminder] =
    useState(null);

  const [eventFilter, setEventFilter] =
    useState("All");

  const notifiedEvents = useRef(new Set());

  /* =========================================
     LOAD EVENTS
  ========================================= */

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch(
          "/api/calendar"
        );

        const data = await response.json();

        if (response.ok) {
          setEvents(data);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error(
          "Failed to fetch calendar events:",
          error
        );
      }
    }

    fetchEvents();
  }, []);

  /* =========================================
     NOTIFICATION PERMISSION
  ========================================= */

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  /* =========================================
     DATE HELPERS
  ========================================= */

  function getEventDate(
    day,
    dateObject = currentDate
  ) {
    const eventYear =
      dateObject.getFullYear();

    const eventMonth =
      dateObject.getMonth();

    return `${eventYear}-${String(
      eventMonth + 1
    ).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  }

  function getTodayDate() {
    const current = new Date();

    return `${current.getFullYear()}-${String(
      current.getMonth() + 1
    ).padStart(2, "0")}-${String(
      current.getDate()
    ).padStart(2, "0")}`;
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName =
    currentDate.toLocaleString(
      "default",
      {
        month: "long",
      }
    );

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  /* =========================================
     MONTH NAVIGATION
  ========================================= */

  function goToPreviousMonth() {
    const newDate = new Date(
      year,
      month - 1,
      1
    );

    setCurrentDate(newDate);

    if (dashboardOnly) {
      setSelectedDate(null);
    } else {
      setSelectedDate(null);
      closeForm();
      setEventFilter("All");
    }
  }

  function goToNextMonth() {
    const newDate = new Date(
      year,
      month + 1,
      1
    );

    setCurrentDate(newDate);

    if (dashboardOnly) {
      setSelectedDate(null);
    } else {
      setSelectedDate(null);
      closeForm();
      setEventFilter("All");
    }
  }

  /* =========================================
     SELECT DATE
  ========================================= */

  function handleDateClick(day) {
    setSelectedDate(day);

    if (!dashboardOnly) {
      closeForm();
    }
  }

  /* =========================================
     FORM
  ========================================= */

  function openAddForm() {
    setEditingEventId(null);
    setEventTitle("");
    setEventType("Note");
    setEventTime("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingEventId(null);
    setEventTitle("");
    setEventType("Note");
    setEventTime("");
  }

  /* =========================================
     SAVE EVENT
  ========================================= */

  async function saveEvent() {
    if (eventTitle.trim() === "") {
      alert("Please enter a title.");
      return;
    }

    if (selectedDate === null) {
      return;
    }

    const eventDate =
      getEventDate(selectedDate);

    try {
      /* EDIT */

      if (editingEventId !== null) {
        const response = await fetch(
          "/api/calendar",
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id: editingEventId,
              title: eventTitle.trim(),
              type: eventType,
              time: eventTime || null,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.error ||
              "Failed to update event."
          );

          return;
        }

        setEvents(
          (previousEvents) =>
            previousEvents.map(
              (event) =>
                event.id ===
                editingEventId
                  ? data
                  : event
            )
        );

        closeForm();

        return;
      }

      /* ADD */

      const response = await fetch(
        "/api/calendar",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            date: eventDate,
            title: eventTitle.trim(),
            type: eventType,
            time: eventTime || null,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to save event."
        );

        return;
      }

      setEvents(
        (previousEvents) => [
          ...previousEvents,
          data,
        ]
      );

      closeForm();
    } catch (error) {
      console.error(error);

      alert(
        editingEventId !== null
          ? "Something went wrong while updating the event."
          : "Something went wrong while saving the event."
      );
    }
  }

  /* =========================================
     EDIT EVENT
  ========================================= */

  function editEvent(event) {
    setEditingEventId(event.id);
    setEventTitle(event.title);
    setEventType(event.type);
    setEventTime(event.time || "");
    setShowForm(true);
  }

  /* =========================================
     DELETE EVENT
  ========================================= */

  async function deleteEvent(eventId) {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this item?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        "/api/calendar",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: eventId,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to delete event."
        );

        return;
      }

      setEvents(
        (previousEvents) =>
          previousEvents.filter(
            (event) =>
              event.id !== eventId
          )
      );

      notifiedEvents.current.delete(
        eventId
      );
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while deleting the event."
      );
    }
  }

  /* =========================================
     REMINDER SYSTEM
  ========================================= */

  useEffect(() => {
    if (events.length === 0) {
      return;
    }

    function checkReminders() {
      const now = new Date();

      const currentDateString =
        `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}-${String(
          now.getDate()
        ).padStart(2, "0")}`;

      const currentTimeString =
        `${String(
          now.getHours()
        ).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}`;

      events.forEach((event) => {
        if (!event.time) {
          return;
        }

        const isCorrectDate =
          event.date ===
          currentDateString;

        const isCorrectTime =
          event.time ===
          currentTimeString;

        const alreadyNotified =
          notifiedEvents.current.has(
            event.id
          );

        if (
          isCorrectDate &&
          isCorrectTime &&
          !alreadyNotified
        ) {
          notifiedEvents.current.add(
            event.id
          );

          setActiveReminder(event);

          if (
            "Notification" in window &&
            Notification.permission ===
              "granted"
          ) {
            try {
              new Notification(
                event.type ===
                  "Reminder"
                  ? "🔔 FocuseMate Reminder"
                  : "📅 FocuseMate Event",
                {
                  body: event.title,
                  icon: "/favicon.ico",
                }
              );
            } catch (error) {
              console.error(
                "Browser notification failed:",
                error
              );
            }
          }
        }
      });
    }

    checkReminders();

    const reminderTimer =
      setInterval(
        checkReminders,
        1000
      );

    return () => {
      clearInterval(
        reminderTimer
      );
    };
  }, [events]);

  /* =========================================
     SELECTED DATE EVENTS
  ========================================= */

  const selectedDateEvents =
    selectedDate !== null
      ? events.filter(
          (event) =>
            event.date ===
            getEventDate(
              selectedDate
            )
        )
      : [];

  /* =========================================
     TODAY'S REMINDERS
  ========================================= */

  const todayDate =
    getTodayDate();

  const todayReminders =
    events.filter(
      (event) =>
        event.date === todayDate &&
        event.type === "Reminder"
    );

  /* =========================================
     CURRENT MONTH EVENTS
  ========================================= */

  const currentMonthEvents =
    events
      .filter((event) => {
        const eventDate =
          new Date(
            `${event.date}T00:00:00`
          );

        return (
          eventDate.getFullYear() ===
            year &&
          eventDate.getMonth() ===
            month
        );
      })
      .sort((a, b) => {
        const dateA =
          new Date(
            `${a.date}T${
              a.time || "00:00"
            }`
          );

        const dateB =
          new Date(
            `${b.date}T${
              b.time || "00:00"
            }`
          );

        return dateA - dateB;
      });

  /* =========================================
     FILTER MONTH EVENTS
  ========================================= */

  const filteredMonthEvents =
    eventFilter === "All"
      ? currentMonthEvents
      : currentMonthEvents.filter(
          (event) =>
            event.type ===
            eventFilter
        );

  /* =========================================
     MONTH COUNTS
  ========================================= */

  const monthEventCount =
    currentMonthEvents.filter(
      (event) =>
        event.type === "Event"
    ).length;

  const monthReminderCount =
    currentMonthEvents.filter(
      (event) =>
        event.type === "Reminder"
    ).length;

  const monthNoteCount =
    currentMonthEvents.filter(
      (event) =>
        event.type === "Note"
    ).length;

  return (
    <div className="calendar-card">

      {/* =====================================
          NOTIFICATION POPUP
          DASHBOARD + CALENDAR PAGE
      ===================================== */}

      {activeReminder && (
        <div
          className="calendar-reminder-popup"
          role="alert"
        >
          <div className="calendar-reminder-icon">
            🔔
          </div>

          <div className="calendar-reminder-content">

            <strong>
              {activeReminder.type ===
              "Reminder"
                ? "Reminder"
                : "Event"}
            </strong>

            <h3>
              {activeReminder.title}
            </h3>

            {activeReminder.time && (
              <p>
                Scheduled for{" "}
                {activeReminder.time}
              </p>
            )}

          </div>

          <button
            type="button"
            className="calendar-reminder-close"
            onClick={() =>
              setActiveReminder(null)
            }
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================
          TODAY'S REMINDERS
          CALENDAR PAGE ONLY
      ===================================== */}

      {!dashboardOnly &&
        todayReminders.length >
          0 && (
          <div
            className="calendar-reminder-notification"
            role="alert"
          >
            <div>

              <strong>
                🔔 Today's Reminders
              </strong>

              {todayReminders.map(
                (reminder) => (
                  <p
                    key={
                      reminder.id
                    }
                  >
                    {reminder.time
                      ? `${reminder.time} — `
                      : ""}
                    {
                      reminder.title
                    }
                  </p>
                )
              )}

            </div>
          </div>
        )}

      {/* =====================================
          CALENDAR CONTENT
      ===================================== */}

      <div
        className={
          dashboardOnly
            ? "calendar-content-layout dashboard-calendar-only"
            : "calendar-content-layout"
        }
      >

        {/* =====================================
            CALENDAR
        ===================================== */}

        <div className="calendar-left">

          <div className="calendar-header">

            <button
              type="button"
              onClick={
                goToPreviousMonth
              }
            >
              ‹
            </button>

            <h2>
              {monthName} {year}
            </h2>

            <button
              type="button"
              onClick={
                goToNextMonth
              }
            >
              ›
            </button>

          </div>

          <div className="calendar-weekdays">

            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>

          </div>

          <div className="calendar-days">

            {Array.from({
              length: firstDay,
            }).map(
              (_, index) => (
                <span
                  key={`empty-${index}`}
                ></span>
              )
            )}

            {Array.from({
              length:
                daysInMonth,
            }).map(
              (_, index) => {
                const day =
                  index + 1;

                const currentToday =
                  new Date();

                const isToday =
                  year ===
                    currentToday.getFullYear() &&
                  month ===
                    currentToday.getMonth() &&
                  day ===
                    currentToday.getDate();

                const isSelected =
                  selectedDate ===
                  day;

                const hasEvent =
                  events.some(
                    (event) =>
                      event.date ===
                      getEventDate(
                        day
                      )
                  );

                const hasReminder =
                  events.some(
                    (event) =>
                      event.date ===
                        getEventDate(
                          day
                        ) &&
                      event.type ===
                        "Reminder"
                  );

                return (
                  <span
                    key={day}
                    className={
                      isSelected
                        ? "selected-date"
                        : isToday
                        ? "today"
                        : ""
                    }
                    onClick={() =>
                      handleDateClick(
                        day
                      )
                    }
                  >
                    {day}

                    {hasEvent && (
                      <small className="event-dot">
                        •
                      </small>
                    )}

                    {hasReminder && (
                      <small className="reminder-dot">
                        🔔
                      </small>
                    )}
                  </span>
                );
              }
            )}

          </div>

          {/* =====================================
              SELECTED DATE INFORMATION

              DASHBOARD:
              Show ONLY event/reminder details

              CALENDAR PAGE:
              Show full controls
          ===================================== */}

          {selectedDate !== null && (
            <div className="selected-date-info">

              <p>
                Selected Date
              </p>

              <h3>
                {selectedDate}{" "}
                {monthName} {year}
              </h3>

              {selectedDateEvents.length >
              0 ? (
                <div className="calendar-events">

                  {selectedDateEvents.map(
                    (event) => (
                      <div
                        className="calendar-event"
                        key={event.id}
                      >

                        <div className="event-details">

                          <strong>
                            {event.title}
                          </strong>

                          <span>
                            {event.type}

                            {event.time &&
                              ` • ${event.time}`}
                          </span>

                        </div>

                        {/* EDIT / DELETE
                            CALENDAR PAGE ONLY */}

                        {!dashboardOnly && (
                          <div className="event-actions">

                            <button
                              type="button"
                              onClick={() =>
                                editEvent(
                                  event
                                )
                              }
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteEvent(
                                  event.id
                                )
                              }
                            >
                              🗑️
                            </button>

                          </div>
                        )}

                      </div>
                    )
                  )}

                </div>
              ) : (
                <p className="no-selected-events">
                  No events or reminders
                  for this date.
                </p>
              )}

              {/* =================================
                  ADD / EDIT FORM
                  CALENDAR PAGE ONLY
              ================================= */}

              {!dashboardOnly &&
                !showForm && (
                  <button
                    type="button"
                    className="add-event-button"
                    onClick={
                      openAddForm
                    }
                  >
                    + Add Note / Event
                  </button>
                )}

              {!dashboardOnly &&
                showForm && (
                  <div className="event-form">

                    <input
                      type="text"
                      placeholder="Enter title"
                      value={
                        eventTitle
                      }
                      onChange={(e) =>
                        setEventTitle(
                          e.target
                            .value
                        )
                      }
                    />

                    <select
                      value={
                        eventType
                      }
                      onChange={(e) =>
                        setEventType(
                          e.target
                            .value
                        )
                      }
                    >
                      <option value="Note">
                        Note
                      </option>

                      <option value="Event">
                        Event
                      </option>

                      <option value="Reminder">
                        Reminder
                      </option>
                    </select>

                    <input
                      type="time"
                      value={
                        eventTime
                      }
                      onChange={(e) =>
                        setEventTime(
                          e.target
                            .value
                        )
                      }
                    />

                    <div className="event-form-buttons">

                      <button
                        type="button"
                        onClick={
                          saveEvent
                        }
                      >
                        {editingEventId !==
                        null
                          ? "Save Changes"
                          : "Save"}
                      </button>

                      <button
                        type="button"
                        className="cancel-event-button"
                        onClick={
                          closeForm
                        }
                      >
                        Cancel
                      </button>

                    </div>

                  </div>
                )}

            </div>
          )}

        </div>

        {/* =====================================
            MONTHLY EVENT PANEL
            CALENDAR PAGE ONLY
        ===================================== */}

        {!dashboardOnly && (
          <div className="monthly-events-panel">

            <div className="monthly-events-header">

              <div>

                <p className="monthly-events-label">
                  THIS MONTH
                </p>

                <h2>
                  {monthName}{" "}
                  {year}
                </h2>

                <p>
                  {
                    currentMonthEvents.length
                  }{" "}
                  {currentMonthEvents.length ===
                  1
                    ? "item"
                    : "items"}{" "}
                  scheduled
                </p>

              </div>

            </div>

            {/* MONTH SUMMARY */}

            <div className="month-summary">

              <div className="month-summary-item">

                <strong>
                  {
                    monthEventCount
                  }
                </strong>

                <span>
                  Events
                </span>

              </div>

              <div className="month-summary-item">

                <strong>
                  {
                    monthReminderCount
                  }
                </strong>

                <span>
                  Reminders
                </span>

              </div>

              <div className="month-summary-item">

                <strong>
                  {
                    monthNoteCount
                  }
                </strong>

                <span>
                  Notes
                </span>

              </div>

            </div>

            {/* FILTERS */}

            <div className="calendar-filters">

              <button
                type="button"
                className={
                  eventFilter ===
                  "All"
                    ? "calendar-filter active"
                    : "calendar-filter"
                }
                onClick={() =>
                  setEventFilter(
                    "All"
                  )
                }
              >
                All
              </button>

              <button
                type="button"
                className={
                  eventFilter ===
                  "Event"
                    ? "calendar-filter active"
                    : "calendar-filter"
                }
                onClick={() =>
                  setEventFilter(
                    "Event"
                  )
                }
              >
                Events
              </button>

              <button
                type="button"
                className={
                  eventFilter ===
                  "Reminder"
                    ? "calendar-filter active"
                    : "calendar-filter"
                }
                onClick={() =>
                  setEventFilter(
                    "Reminder"
                  )
                }
              >
                Reminders
              </button>

              <button
                type="button"
                className={
                  eventFilter ===
                  "Note"
                    ? "calendar-filter active"
                    : "calendar-filter"
                }
                onClick={() =>
                  setEventFilter(
                    "Note"
                  )
                }
              >
                Notes
              </button>

            </div>

            {/* MONTHLY EVENT LIST */}

            <div className="monthly-events-list">

              {filteredMonthEvents.length ===
              0 ? (
                <div className="no-month-events">

                  <div>
                    {eventFilter ===
                    "All"
                      ? "📅"
                      : eventFilter ===
                        "Event"
                      ? "📅"
                      : eventFilter ===
                        "Reminder"
                      ? "🔔"
                      : "📝"}
                  </div>

                  <p>
                    No{" "}
                    {eventFilter ===
                    "All"
                      ? "events, reminders or notes"
                      : eventFilter.toLowerCase() +
                        "s"}{" "}
                    for{" "}
                    {monthName}.
                  </p>

                </div>
              ) : (
                filteredMonthEvents.map(
                  (event) => {

                    const eventDate =
                      new Date(
                        `${event.date}T00:00:00`
                      );

                    const formattedDate =
                      eventDate.toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                        }
                      );

                    const formattedTime =
                      event.time
                        ? new Date(
                            `2000-01-01T${event.time}`
                          ).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute:
                                "2-digit",
                            }
                          )
                        : "No time";

                    return (
                      <div
                        className={`monthly-event-box ${event.type.toLowerCase()}`}
                        key={
                          event.id
                        }
                      >

                        <div className="monthly-event-icon">

                          {event.type ===
                          "Event"
                            ? "📅"
                            : event.type ===
                              "Reminder"
                            ? "🔔"
                            : "📝"}

                        </div>

                        <div className="monthly-event-info">

                          <div className="monthly-event-top">

                            <span className="monthly-event-type">
                              {
                                event.type
                              }
                            </span>

                            <span className="monthly-event-date">
                              {
                                formattedDate
                              }
                            </span>

                          </div>

                          <h3>
                            {
                              event.title
                            }
                          </h3>

                          <p>
                            {event.time
                              ? `⏰ ${formattedTime}`
                              : "No time specified"}
                          </p>

                        </div>

                        <div className="monthly-event-actions">

                          <button
                            type="button"
                            onClick={() =>
                              editEvent(
                                event
                              )
                            }
                            title="Edit"
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteEvent(
                                event.id
                              )
                            }
                            title="Delete"
                          >
                            🗑️
                          </button>

                        </div>

                      </div>
                    );
                  }
                )
              )}

            </div>

          </div>
        )}

      </div>

    </div>
  );
}