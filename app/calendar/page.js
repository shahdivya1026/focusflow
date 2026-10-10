"use client";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import AuthGuard from "../components/AuthGuard";
import Calendar from "../components/Calendar";

export default function CalendarPage() {
  return (
    <AuthGuard>
      <main>
        <div className="dashboard-layout">

          <Sidebar />

          <div className="dashboard-content">

            <Header />

            <div className="calendar-page">
              <Calendar />
            </div>

          </div>

        </div>
      </main>
    </AuthGuard>
  );
}