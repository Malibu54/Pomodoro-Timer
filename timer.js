class Pomodoro {
  constructor() {
    // Elements
    this.timerEl = document.getElementById("pomodoro-timer");
    this.sessionTypeEl = document.getElementById("pomodoro-session-type");
    this.taskInput = document.getElementById("pomodoro-task");
    this.startBtn = document.getElementById("start-btn");
    this.pauseBtn = document.getElementById("pause-btn");
    this.stopBtn = document.getElementById("stop-btn");
    this.workDurationInput = document.getElementById("work-duration");
    this.breakDurationInput = document.getElementById("break-duration");
    this.sessionsList = document.getElementById("pomodoro-sessions");

    // State
    this.WORK = "Work";
    this.BREAK = "Break";
    this.isRunning = false;
    this.timer = null;
    this.currentType = this.WORK;
    this.taskLabel = "";
    this.timeLeft = this.workDurationInput.value * 60;
    this.workDuration = this.workDurationInput.value * 60;
    this.breakDuration = this.breakDurationInput.value * 60;
    this.elapsedTime = 0;
    this.sessionHistory = JSON.parse(localStorage.getItem("pomodoroSessions")) || [];

    // Initialize
    this.updateTimerDisplay();
    this.updateSessionTypeDisplay();
    this.renderSessionLog();
    this.addEventListeners();
    this.updateButtons();
  }

  addEventListeners() {
    this.startBtn.addEventListener("click", () => this.startTimer());
    this.pauseBtn.addEventListener("click", () => this.pauseTimer());
    this.stopBtn.addEventListener("click", () => this.stopTimer());

    this.workDurationInput.addEventListener("input", () => {
      const val = parseInt(this.workDurationInput.value, 10);
      if (val > 0) {
        this.workDuration = val * 60;
        if (this.currentType === this.WORK && !this.isRunning) {
          this.timeLeft = this.workDuration;
          this.updateTimerDisplay();
        }
      }
    });

    this.breakDurationInput.addEventListener("input", () => {
      const val = parseInt(this.breakDurationInput.value, 10);
      if (val > 0) {
        this.breakDuration = val * 60;
        if (this.currentType === this.BREAK && !this.isRunning) {
          this.timeLeft = this.breakDuration;
          this.updateTimerDisplay();
        }
      }
    });
  }

  startTimer() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.updateButtons();
    this.taskLabel = this.currentType === this.WORK
      ? this.taskInput.value.trim() || "Work"
      : "Break";
    if (this.currentType === this.BREAK) {
      this.taskInput.disabled = true;
    }
    this.timer = setInterval(() => this.tick(), 1000);
  }

  pauseTimer() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.updateButtons();
    clearInterval(this.timer);
  }

  stopTimer() {
    if (this.timer) clearInterval(this.timer);
    this.isRunning = false;

    // Guardar la sesión actual en el log si algo se hizo
    if (this.elapsedTime > 0) {
      this.logSession();
    }

    // Reset
    this.currentType = this.currentType === this.WORK ? this.WORK : this.BREAK;
    this.timeLeft = this.currentType === this.WORK ? this.workDuration : this.breakDuration;
    this.elapsedTime = 0;
    this.taskInput.disabled = false;
    this.updateTimerDisplay();
    this.updateSessionTypeDisplay();
    this.updateButtons();
  }

  tick() {
    if (this.timeLeft > 0) {
      this.timeLeft--;
      this.elapsedTime++;
      this.updateTimerDisplay();
    } else {
      this.completeSession();
    }
  }

  completeSession() {
    this.playBeep();
    this.logSession();
    // Alternar sesión
    if (this.currentType === this.WORK) {
      this.currentType = this.BREAK;
      this.timeLeft = this.breakDuration;
      this.taskInput.disabled = true;
      this.taskInput.value = "Break";
    } else {
      this.currentType = this.WORK;
      this.timeLeft = this.workDuration;
      this.taskInput.disabled = false;
      this.taskInput.value = "";
    }
    this.elapsedTime = 0;
    this.updateSessionTypeDisplay();
    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    this.timerEl.textContent = `${this.pad(mins)}:${this.pad(secs)}`;
    // Cambiar color según tipo
    if (this.currentType === this.WORK) {
      this.timerEl.classList.add("work");
      this.timerEl.classList.remove("break");
    } else {
      this.timerEl.classList.add("break");
      this.timerEl.classList.remove("work");
    }
  }

  updateSessionTypeDisplay() {
    this.sessionTypeEl.textContent = this.currentType + " Session";
    if (this.currentType === this.WORK) {
      this.sessionTypeEl.classList.add("work");
      this.sessionTypeEl.classList.remove("break");
    } else {
      this.sessionTypeEl.classList.add("break");
      this.sessionTypeEl.classList.remove("work");
    }
  }

  updateButtons() {
    this.startBtn.disabled = this.isRunning;
    this.pauseBtn.disabled = !this.isRunning;
    this.stopBtn.disabled = !this.isRunning && this.elapsedTime === 0;
  }

  pad(num) {
    return num.toString().padStart(2, "0");
  }

  logSession() {
    const now = new Date();
    const elapsedMinutes = Math.round(this.elapsedTime / 60);
    const session = {
      type: this.currentType,
      task: this.taskLabel,
      duration: elapsedMinutes,
      timestamp: now.toLocaleString(),
    };
    this.sessionHistory.unshift(session);
    if (this.sessionHistory.length > 10) {
      this.sessionHistory.pop();
    }
    localStorage.setItem("pomodoroSessions", JSON.stringify(this.sessionHistory));
    this.renderSessionLog();
  }

  renderSessionLog() {
    this.sessionsList.innerHTML = "";
    this.sessionHistory.forEach((session) => {
      const li = document.createElement("li");
      li.textContent = `${session.timestamp} - ${session.type}: "${session.task}" for ${session.duration} min`;
      this.sessionsList.appendChild(li);
    });
  }

  playBeep() {
    // Sonido simple
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1000, context.currentTime);
    oscillator.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.3);
  }
}

window.onload = () => {
  new Pomodoro();
};