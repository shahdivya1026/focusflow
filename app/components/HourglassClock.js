"use client";

import { useEffect, useState } from "react";

export default function HourglassClock() {
  const [time, setTime] = useState(null);

  /*
    DAILY MOTIVATION MESSAGES
    -------------------------
    The quote is selected using the day of the year,
    so the same quote will not appear twice in one year.
  */

  const dailyQuotes = [
    "Focus on what matters.",
    "Small steps still move you forward.",
    "Make today count.",
    "Progress begins with one step.",
    "Keep going, even when it feels slow.",
    "Your time is worth protecting.",
    "One task at a time.",
    "Start where you are.",
    "Consistency creates progress.",
    "Give your best to today.",
    "A little progress is still progress.",
    "Keep moving forward.",
    "Your effort will add up.",
    "Do something today your future self will thank you for.",
    "Stay patient with your progress.",
    "Focus brings clarity.",
    "You are closer than you think.",
    "Use your time with intention.",
    "Progress is built quietly.",
    "Keep your momentum going.",
    "Today is another chance to improve.",
    "Do not rush your growth.",
    "Trust the process.",
    "Keep showing up.",
    "Your goals deserve your attention.",
    "Make room for what matters.",
    "Turn effort into progress.",
    "Stay focused on the next step.",
    "Every day is a fresh start.",
    "Keep building.",
    "Good things take consistent effort.",
    "Let your actions speak.",
    "Focus creates results.",
    "Keep learning, keep growing.",
    "Your future is built today.",
    "Do not underestimate small beginnings.",
    "Keep your eyes on the goal.",
    "Progress does not need to be perfect.",
    "Make your time meaningful.",
    "One good decision can change your day.",
    "Stay committed to your goals.",
    "Keep going at your own pace.",
    "Your effort matters.",
    "Start now, improve later.",
    "Make today productive.",
    "Be present in what you are doing.",
    "Keep moving, one step at a time.",
    "You do not have to do everything today.",
    "Focus on what you can control.",
    "Give today your attention.",
    "Your consistency is your strength.",
    "Keep working toward better.",
    "Every effort teaches you something.",
    "Progress starts with action.",
    "Stay curious.",
    "Make progress, not excuses.",
    "Your goals need action.",
    "Keep your priorities clear.",
    "A focused mind can go far.",
    "Keep improving.",
    "Take the next step.",
    "Do not wait for perfect conditions.",
    "Your journey is your own.",
    "Stay steady.",
    "Make time for what matters.",
    "Keep your purpose close.",
    "Small wins matter.",
    "Keep building your future.",
    "Your time is limited, use it wisely.",
    "Stay focused and keep moving.",
    "One productive moment can change your day.",
    "Keep believing in your progress.",
    "Let today be useful.",
    "Keep learning something new.",
    "Your patience will pay off.",
    "Focus on progress, not perfection.",
    "Make every moment useful.",
    "Stay disciplined with your goals.",
    "Keep your mind on the next step.",
    "You can improve one day at a time.",
    "Do not stop because progress feels slow.",
    "Keep creating better habits.",
    "Your daily choices shape your future.",
    "Stay focused on your direction.",
    "Keep your goals visible.",
    "Make today better than yesterday.",
    "Keep going through the difficult parts.",
    "Your effort today matters tomorrow.",
    "Stay committed.",
    "Keep taking action.",
    "Your progress is worth the effort.",
    "Focus your energy wisely.",
    "Be consistent with what matters.",
    "Keep growing at your own pace.",
    "A calm mind can accomplish a lot.",
    "Give yourself room to grow.",
    "Keep moving toward your goals.",
    "Do not let one bad day define you.",
    "Start again whenever you need to.",
    "Your next step matters.",
    "Stay patient and keep working.",
    "Progress comes from persistence.",
    "Keep your attention where it belongs.",
    "Make your effort intentional.",
    "Your goals are built one day at a time.",
    "Stay focused on the bigger picture.",
    "Keep making progress.",
    "Every new day brings another opportunity.",
    "Use today well.",
    "Keep your momentum alive.",
    "Your habits shape your days.",
    "Stay consistent even when motivation fades.",
    "Keep working quietly.",
    "The next step is enough for now.",
    "Make progress in your own way.",
    "Stay focused on what you can do today.",
    "Your effort is never wasted.",
    "Keep improving one thing at a time.",
    "Be proud of every step forward.",
    "Keep your priorities simple.",
    "Your future self is counting on you.",
    "Stay committed to becoming better.",
    "Keep going with purpose.",
    "One focused hour can make a difference.",
    "Your time deserves intention.",
    "Keep learning from every experience.",
    "Progress grows from consistency.",
    "Stay calm and keep moving.",
    "Make today meaningful.",
    "Keep working toward what matters.",
    "You are building something with every effort.",
    "Stay focused through the distractions.",
    "Keep your goals bigger than your excuses.",
    "Every step forward is valuable.",
    "Make the next moment count.",
    "Keep moving even when the path feels unclear.",
    "Your progress does not need comparison.",
    "Stay true to your goals.",
    "Keep showing up for yourself.",
    "A better tomorrow starts with today.",
    "Keep putting in the work.",
    "Your small efforts create big changes.",
    "Stay focused on your growth.",
    "Make progress your priority.",
    "Keep your energy where it matters.",
    "Do not underestimate what consistency can do.",
    "Keep taking one step forward.",
    "Your goals are worth your patience.",
    "Stay steady through the process.",
    "Every day adds to your journey.",
    "Keep making your future stronger.",
    "Focus on the work in front of you.",
    "Keep moving toward meaningful goals.",
    "Your dedication will compound.",
    "Stay present and keep progressing.",
    "Make your time count.",
    "Keep improving your direction.",
    "Your journey is made of small moments.",
    "Stay focused and trust yourself.",
    "Keep working toward your next milestone.",
    "Every day is part of the bigger picture.",
    "Keep your effort consistent.",
    "Choose progress today.",
    "Stay committed to your path.",
    "Keep your mind focused on possibilities.",
    "Your work today creates tomorrow's results.",
    "Keep building good habits.",
    "Stay patient with the journey.",
    "Make space for meaningful progress.",
    "Keep moving beyond yesterday.",
    "Your consistency matters more than perfection.",
    "Stay focused on the things that matter.",
    "Keep giving your goals a chance.",
    "Every attempt makes you better.",
    "Make today another step forward.",
    "Keep learning from the process.",
    "Stay focused even when distractions appear.",
    "Your progress is yours to build.",
    "Keep choosing what moves you forward.",
    "Small actions become strong habits.",
    "Stay dedicated to your growth.",
    "Keep your direction clear.",
    "Your effort creates possibilities.",
    "Make the most of this moment.",
    "Keep your focus steady.",
    "Every day gives you something to build on.",
    "Stay committed to improvement.",
    "Keep moving with intention.",
    "Your goals become real through action.",
    "Make progress part of your routine.",
    "Keep your standards high and your pace steady.",
    "Stay focused on the journey.",
    "Your work matters, even when nobody sees it.",
    "Keep going beyond the easy moments.",
    "Every focused moment adds up.",
    "Stay patient, stay consistent.",
    "Make today a step toward something better.",
    "Keep your goals close and your distractions distant.",
    "Your future is shaped by today's choices.",
    "Stay focused and keep learning.",
    "Keep turning ideas into action.",
    "Every day is another opportunity to grow.",
    "Make your effort count.",
    "Keep building one habit at a time.",
    "Stay steady and trust your progress.",
    "Your next achievement starts with today's effort.",
    "Keep moving with purpose.",
    "Focus creates momentum.",
    "Stay committed even when results take time.",
    "Keep choosing progress.",
    "Your journey deserves patience.",
    "Make room for improvement.",
    "Keep working toward your best.",
    "Stay focused on what you want to create.",
    "Every small improvement matters.",
    "Keep going until the next milestone.",
    "Your time can become your greatest advantage.",
    "Stay intentional with your day.",
    "Keep your focus stronger than your distractions.",
    "Make today another page in your progress.",
    "Your effort becomes your experience.",
    "Stay consistent and let time work with you.",
    "Keep learning, even from small mistakes.",
    "Your progress has its own pace.",
    "Make your next decision a good one.",
    "Keep your purpose stronger than your excuses.",
    "Stay focused on what is within your control.",
    "Every moment is an opportunity to begin again.",
    "Keep improving your yesterday.",
    "Your patience is part of your progress.",
    "Stay dedicated to the process.",
    "Keep taking meaningful steps.",
    "Your goals are built through daily choices.",
    "Make your time work for you.",
    "Keep your attention on the present task.",
    "Stay focused, stay patient, stay consistent.",
    "Every effort brings you closer to growth.",
    "Keep moving even when progress is invisible.",
    "Your consistency will speak for itself.",
    "Make today worth remembering.",
    "Keep creating better days.",
    "Stay focused on becoming better, not being perfect.",
    "Your actions today shape your direction.",
    "Keep working with patience.",
    "Every new day is another chance to progress.",
    "Stay committed to the things you value.",
    "Keep your goals bigger than temporary setbacks.",
    "Your progress is happening one step at a time.",
    "Make the next hour meaningful.",
    "Keep showing up with intention.",
    "Stay focused on the road ahead.",
    "Your effort today is an investment in tomorrow.",
    "Keep learning and adapting.",
    "Every step teaches you something.",
    "Make progress your daily habit.",
    "Stay patient when results take time.",
    "Keep your focus on forward movement.",
    "Your journey is worth the effort.",
    "Make today productive in your own way.",
    "Keep choosing actions that matter.",
    "Stay consistent with your priorities.",
    "Every focused day builds a stronger future.",
    "Keep moving toward the life you want.",
    "Your small decisions create your bigger story.",
    "Stay focused and make today count.",
    "Keep your goals alive through action.",
    "Progress is a collection of small wins.",
    "Make your next step intentional.",
    "Stay steady and keep building.",
    "Your future begins with what you do today.",
    "Keep going, your effort matters.",
    "Every day you learn is a day you grow.",
    "Stay focused through the noise.",
    "Make your time meaningful today.",
    "Keep improving without rushing.",
    "Your best work starts with attention.",
    "Stay committed to your own progress.",
    "Keep moving forward with patience.",
    "Every moment spent wisely adds value.",
    "Make today another opportunity to grow.",
    "Stay focused on the things that matter most.",
    "Keep working toward something meaningful.",
    "Your consistency is building something bigger.",
    "Stay patient and keep taking action.",
    "Make every day a little better.",
    "Keep your mind on progress.",
    "Your effort today becomes tomorrow's strength.",
    "Stay focused, keep moving.",
    "Every small step counts.",
    "Make today count toward your goals.",
    "Keep building your future one day at a time.",
    "Stay committed to the next step.",
    "Your progress is worth protecting.",
    "Keep going with purpose.",
    "Make time for what truly matters.",
    "Stay steady and trust the work.",
    "Every day is another chance to improve.",
    "Keep your focus on meaningful progress.",
    "Your daily effort creates long-term change.",
    "Stay patient, keep learning.",
    "Make your next step count.",
    "Keep moving toward better.",
    "Your goals deserve consistent effort.",
    "Stay focused and use your time wisely.",
    "Every effort is part of the journey.",
    "Keep going, one day at a time.",
    "Make today another step forward.",
    "Stay committed to your growth.",
    "Your progress is built in ordinary moments.",
    "Keep choosing progress over perfection.",
    "Focus on today, build for tomorrow.",
    "Stay steady and keep moving forward.",
    "Every day gives you another opportunity.",
    "Make your time matter.",
    "Keep your effort consistent.",
    "Your journey becomes stronger with every step.",
    "Stay focused and keep improving.",
    "Make today meaningful.",
    "Keep working toward what matters most.",
    "Your future is built through today's actions.",
    "Stay patient with your progress.",
    "Every focused moment is valuable.",
    "Keep moving with intention.",
    "Make progress your priority today.",
    "Stay committed and keep growing.",
    "Your effort adds up.",
    "Keep taking the next step.",
    "Today is another chance to move forward.",
    "Stay focused on your direction.",
    "Make every moment count.",
    "Keep building something you're proud of.",
    "Your progress deserves patience.",
    "Stay consistent and keep going.",
    "Every day is a new opportunity to begin.",
    "Make today useful.",
    "Keep your focus where it matters.",
    "Your actions create your momentum.",
    "Stay dedicated to the process.",
    "Keep improving one day at a time.",
    "Make this day count.",
    "Your future self will appreciate today's effort.",
    "Stay focused and trust your journey.",
    "Keep moving toward your goals.",
    "Every small action can create progress.",
    "Make today part of something bigger.",
    "Stay patient, stay focused.",
    "Keep working with purpose.",
    "Your consistency creates change.",
    "Every day adds another step to your story.",
    "Make progress, then make more progress.",
    "Stay committed to becoming better.",
    "Keep your priorities clear.",
    "Your time is valuable.",
    "Make today matter.",
    "Keep going, even one small step.",
    "Stay focused on what you can do now.",
    "Every effort brings a lesson.",
    "Make your next moment productive.",
    "Keep building your momentum.",
    "Stay patient and trust the process.",
    "Your daily actions shape your future.",
    "Keep moving toward meaningful goals.",
    "Make room for progress today.",
    "Stay consistent with what matters.",
    "Every day is a chance to get better.",
    "Keep your focus strong.",
    "Your effort is creating your path.",
    "Make today another step toward your goals.",
    "Stay committed to your journey.",
    "Keep learning and moving forward.",
    "Your progress is worth the patience.",
    "Every moment is another opportunity.",
    "Make your effort intentional.",
    "Stay focused and keep building.",
    "Keep your eyes on the next step.",
    "Your future grows from today's choices.",
    "Make today count.",
    "Stay steady and keep progressing.",
    "Every small win deserves recognition.",
    "Keep moving forward with confidence.",
    "Your goals need patience and action.",
    "Stay focused on meaningful work.",
    "Make the most of today.",
    "Keep improving your tomorrow through today.",
    "Your journey is built one day at a time.",
    "Stay consistent and trust your effort.",
    "Every day can move you forward.",
    "Make your time count.",
    "Keep going with intention.",
    "Your progress is stronger than you think.",
    "Stay focused, keep growing.",
    "Make today another opportunity to improve.",
    "Keep taking steps toward better.",
    "Your effort today has value.",
    "Stay patient and keep moving.",
    "Every focused choice matters.",
    "Make progress part of your everyday life.",
    "Keep building toward your goals.",
    "Your future is waiting for today's effort.",
    "Stay committed to progress.",
    "Make today meaningful and keep moving.",
    "Every step forward matters.",
    "Keep your focus on what truly matters.",
    "Your consistency is your progress.",
    "Stay steady through every season.",
    "Make every day an opportunity.",
    "Keep learning, growing, and moving forward.",
    "Your effort today shapes your tomorrow.",
    "Stay focused and make the moment count.",
    "Keep moving, keep improving.",
    "Every day is worth using well.",
    "Make progress one choice at a time.",
    "Stay committed to your goals.",
    "Your time is yours to use wisely.",
    "Keep working toward a better version of yourself.",
    "Make today a step in the right direction.",
    "Stay patient with the process.",
    "Every small action moves the story forward.",
    "Keep your attention on the present.",
    "Your future is built in moments like this.",
    "Stay focused and keep taking action.",
    "Make your day count.",
    "Keep going and let progress speak.",
    "Every effort makes a difference.",
    "Stay consistent, stay focused.",
    "Your goals are worth the work.",
    "Make today another meaningful step.",
    "Keep your momentum going.",
    "Stay patient, your progress is growing.",
    "Every day is another chance to move closer.",
    "Make time for what matters.",
    "Keep building your future.",
    "Your effort is part of your success.",
    "Stay focused on the next right step.",
    "Make today count toward something meaningful.",
    "Keep going, even when the progress is quiet.",
    "Every small step becomes part of something bigger.",
    "Stay committed to your growth.",
    "Your time matters.",
    "Make every day useful.",
    "Keep moving forward with purpose.",
    "Your progress is created by what you repeat.",
    "Stay focused and keep improving.",
    "Make today a good day to begin.",
    "Every new morning brings another opportunity.",
    "Keep taking one meaningful step at a time.",
    "Your effort is building your future.",
    "Stay steady, keep learning.",
    "Make progress your direction.",
    "Every focused moment adds to your journey.",
    "Keep your goals in sight.",
    "Stay committed even when the results are slow.",
    "Your patience is helping you grow.",
    "Make today another page of progress.",
    "Keep moving toward what matters.",
    "Every day you show up is progress.",
    "Stay focused on becoming better.",
    "Make your next action count.",
    "Keep going with patience and purpose.",
    "Your daily choices matter.",
    "Stay consistent and keep growing.",
    "Every step is part of the journey.",
    "Make today meaningful.",
    "Keep building one day at a time.",
    "Your future deserves today's effort.",
    "Stay focused on your priorities.",
    "Make progress, even if it is small.",
    "Keep your direction clear.",
    "Every day gives you a new chance.",
    "Stay patient and keep moving forward.",
    "Your effort is never meaningless.",
    "Make your time valuable.",
    "Keep learning from the journey.",
    "Stay committed to progress.",
    "Every small improvement matters.",
    "Make today another step toward your goals.",
    "Keep moving forward.",
    "Your consistency will take you further.",
    "Stay focused and make the most of today.",
    "Every moment can be used well.",
    "Keep building the future you want.",
    "Make today count."
  ];

  /*
    CLOCK
    -----
    Starts after component mount to avoid hydration mismatch.
  */

  useEffect(() => {
    setTime(new Date());

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /*
    LOADING STATE
  */

  if (!time) {
    return (
      <div className="hourglass-card">

        <div className="hourglass-header">
          <h2>Focus Hour</h2>
        </div>

        <div className="hourglass-container">

          <div className="fm-hourglass-scene">

            <div className="fm-hourglass-body">

              <div className="fm-hourglass-cap fm-hourglass-cap-top"></div>

              <div className="fm-glass-top">
                <div className="fm-sand-top"></div>
              </div>

              <div className="fm-hourglass-neck">
                <div className="fm-sand-stream"></div>
              </div>

              <div className="fm-glass-bottom">
                <div className="fm-sand-bottom"></div>
              </div>

              <div className="fm-glass-shine"></div>

              <div className="fm-hourglass-cap fm-hourglass-cap-bottom"></div>

            </div>

          </div>

        </div>

        <div className="digital-time">
          <span>--</span>
          <b>:</b>
          <span>--</span>
          <b>:</b>
          <span>--</span>
        </div>

      </div>
    );
  }

  /*
    CURRENT TIME
  */

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  /*
    CURRENT HOUR PROGRESS
  */

  const hourProgress =
    (minutes * 60 + seconds) / 3600;

  /*
    DIGITAL CLOCK
  */

  const displayHours = String(hours).padStart(2, "0");
  const displayMinutes = String(minutes).padStart(2, "0");
  const displaySeconds = String(seconds).padStart(2, "0");

  /*
    DAY INFORMATION
  */

  const startOfYear = new Date(time.getFullYear(), 0, 1);

  const dayOfYear =
    Math.floor(
      (time - startOfYear) / (1000 * 60 * 60 * 24)
    ) + 1;

  const year = time.getFullYear();

  const daysInYear =
    (year % 4 === 0 && year % 100 !== 0) ||
    year % 400 === 0
      ? 366
      : 365;
      
  const daysRemaining = daysInYear - dayOfYear;

  /*
    DAY / DATE
  */

  const dayName = time.toLocaleDateString("en-IN", {
    weekday: "long",
  });

  const dateText = time.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  /*
    TIME OF DAY
  */

  let greeting = "GOOD EVENING!";

  if (hours >= 5 && hours < 12) {
    greeting = "GOOD MORNING!";
  } else if (hours >= 12 && hours < 17) {
    greeting = "GOOD AFTERNOON!";
  } else if (hours >= 17 && hours < 21) {
    greeting = "GOOD EVENING!";
  } else {
    greeting = "GOOD NIGHT!";
  }

  /*
    DAILY QUOTE

    One quote is selected according to the day of the year.
    Refreshing the page on the same day keeps the same quote.
  */

  const quoteIndex = (dayOfYear - 1) % dailyQuotes.length;
  const dailyQuote = dailyQuotes[quoteIndex];

  return (
    <div className="hourglass-card">

      <div className="hourglass-header">
        <h2>Focus Hour</h2>
      </div>

      {/* =========================
          HOURGLASS
      ========================= */}

      <div className="hourglass-container">

        <div className="fm-hourglass-scene">

          <div className="fm-hourglass-body">

            <div className="fm-hourglass-cap fm-hourglass-cap-top"></div>

            <div className="fm-glass-top">

              <div
                className="fm-sand-top"
                style={{
                  "--fm-progress": 1 - hourProgress,
                }}
              ></div>

            </div>

            <div className="fm-hourglass-neck">

              <div className="fm-sand-stream"></div>

            </div>

            <div className="fm-glass-bottom">

              <div
                className="fm-sand-bottom"
                style={{
                  "--fm-progress": hourProgress,
                }}
              ></div>

            </div>

            <div className="fm-glass-shine"></div>

            <div className="fm-hourglass-cap fm-hourglass-cap-bottom"></div>

          </div>

        </div>

      </div>

      {/* =========================
          DIGITAL CLOCK
      ========================= */}

      <div className="digital-time">

        <span>{displayHours}</span>

        <b>:</b>

        <span>{displayMinutes}</span>

        <b>:</b>

        <span>{displaySeconds}</span>

      </div>

      {/* =========================
          DAY INFORMATION
      ========================= */}

      <div className="hourglass-day-info">

        <h3>{greeting}</h3>

        <p className="hourglass-date">
          {dayName.toUpperCase()}, {dateText.toUpperCase()}
        </p>

        <div className="hourglass-year-info">
          <span>Day {dayOfYear} of {daysInYear}</span>
          <span>{daysRemaining} Days remaining this year</span>
        </div>

        <p className="hourglass-quote">
          "{dailyQuote}"
        </p>

      </div>

    </div>
  );
}