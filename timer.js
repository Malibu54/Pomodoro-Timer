const pomodoroTimer = document.querySelector("#pomodoro-timer");
const currentTaskLabel = document.querySelector("#pomodoro-clock-task");
const startButton = document.querySelector("#pomodoro-start");
const pauseButton = document.querySelector("#pomodoro-pause");
const stopButton = document.querySelector("#pomodoro-stop");
let workDurationInput = document.querySelector("#input-work-duration");
let breakDurationInput = document.querySelector("#input-break-duration");

let type = "Work";
let timeSpentInCurrentSession = 0;

// Start timer
startButton.addEventListener("click", () => {
  toggleClock();
});

// Pause timer
pauseButton.addEventListener("click", () => {
  toggleClock();
});

// Stop timer
stopButton.addEventListener("click", () => {
  toggleClock(true);
});

let isClockRunning = false;
let workSessionDuration = 1500;
let currentTimeLeftInSession = 1500;
let breakSessionDuration = 300;
let clockTimer = null;
let updatedWorkSessionDuration;
let updatedBreakSessionDuration;
workDurationInput.value = "25";
breakDurationInput.value = "5";

const toggleClock = (reset) => {
  if (reset) {
    stopClock();
  } else {
    if (isClockRunning) {
      setUpdatedTimers();
      isClockRunning = false;
    } else {
      clearInterval(clockTimer);
      clockTimer = setInterval(() => {
        stepDown();
        displayCurrentTimeLeftInSession();
      }, 1000);
      isClockRunning = true;
    }
  }
};

const displayCurrentTimeLeftInSession = () => {
  const secondsLeft = currentTimeLeftInSession;
  let result = "";
  const seconds = secondsLeft % 60;
  const minutes = parseInt(secondsLeft / 60) % 60;
  let hours = parseInt(secondsLeft / 3600);

  function addLeadingZeroes(time) {
    return time < 10 ? `0${time}` : time;
  }
  if (hours > 0) result += `${hours}:`;
  result += `${addLeadingZeroes(minutes)}:${addLeadingZeroes(seconds)}`;
  pomodoroTimer.innerText = result.toString();
};

const stepDown = () => {
  if (currentTimeLeftInSession > 0) {
    currentTimeLeftInSession--;
    timeSpentInCurrentSession++;
  } else if (currentTimeLeftInSession === 0) {
    timeSpentInCurrentSession = 0;

    // Time is over -> if work switch to break, viceversa
    if (type === "Work") {
      currentTimeLeftInSession = breakSessionDuration;
      displaySessionLog("Work");
      type = "Break";
      currentTaskLabel.value = "Break";
      currentTaskLabel.disabled = true;
    } else {
      currentTimeLeftInSession = workSessionDuration;
      type = "Work";
      if (currentTaskLabel.value === "Break") {
        currentTaskLabel.value = workSessionLabel;
      }
      currentTaskLabel.disabled = false;
      displaySessionLog("Break");
    }
  }
};

const displaySessionLog = (type) => {
  const sessionList = document.querySelector("#pomodoro-sessions");
  const li = document.createElement("li");
  let sessionLabel;
  if (type === "Work") {
    sessionLabel = currentTaskLabel.value ? currentTaskLabel.value : "Work";
    workSessionLabel = sessionLabel;
  } else {
    sessionLabel = "Break";
  }
  let elapsedTime = parseInt(timeSpentInCurrentSession / 60);
  elapsedTime = elapsedTime > 0 ? elapsedTime : "<1";

  const text = document.createTextNode(`${sessionLabel} : ${elapsedTime}`);
  li.appendChild(text);
  sessionList.appendChild(li);
};

const stopClock = () => {
  clearInterval(clockTimer);
  isClockRunning = false;
  currentTimeLeftInSession = workSessionDuration;
  displaySessionLog(type);
  displayCurrentTimeLeftInSession();
  type = type === "Work" ? "Break" : "Work";
};

workDurationInput.addEventListener("input", () => {
  updatedWorkSessionDuration = minuteToSeconds(workDurationInput.value);
});

breakDurationInput.addEventListener("input", () => {
  updatedBreakSessionDuration = minuteToSeconds(breakDurationInput.value);
});

const minuteToSeconds = (mins) => {
  return mins * 60;
};

const setUpdatedTimers = () => {
  if (type === "Work") {
    currentTimeLeftInSession = updatedWorkSessionDuration
      ? updatedWorkSessionDuration
      : workSessionDuration;
    workSessionDuration = currentTimeLeftInSession;
  } else {
    currentTimeLeftInSession = updatedBreakSessionDuration
      ? updatedBreakSessionDuration
      : breakSessionDuration;
    breakSessionDuration = currentTimeLeftInSession;
  }
};

/*start from here "Let’s also add a call inside of our stepDown function so that we will update the timers when a session finishes."*/