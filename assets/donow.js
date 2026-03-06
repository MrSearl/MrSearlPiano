
let currentPage = 1;
let timerInterval = null;
let totalSeconds = 0;
let isRunning = false;

const notes = [
  "A.svg",
  "B.svg",
  "C2.svg",
  "D2.svg",
  "E.svg",
  "E2.svg",
  "F.svg",
  "F2.svg",
  "G.svg"
];

function shuffle(array){
  for(let i = array.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function openDoNowInline(){
  resetPages();
  buildNumbers();
  document.getElementById("doNowOverlay").classList.add("active");
}

function closeDoNowInline(){
  document.getElementById("doNowOverlay").classList.remove("active");
}

function resetPages(){
  currentPage = 1;
  document.getElementById("page1").classList.add("active");
  document.getElementById("page2").classList.remove("active");
}

function buildNumbers(){

  const page1 = document.getElementById("page1");
  const page2 = document.getElementById("page2");

  page1.innerHTML = "";
  page2.innerHTML = "";

  let finalNotes = [];

  while(finalNotes.length < 20){
    const shuffled = shuffle([...notes]);
    finalNotes = finalNotes.concat(shuffled);
  }

  finalNotes = finalNotes.slice(0, 20);

  // Page 1 (1–10)
  for(let i = 0; i < 10; i++){
    const div = document.createElement("div");
    div.className = "grid-number";

    const number = document.createElement("div");
    number.className = "note-number";
    number.textContent = i + 1;

    const img = document.createElement("img");
    img.src = "../donownotes/" + finalNotes[i];
    img.alt = "Note";

    div.appendChild(number);
    div.appendChild(img);
    page1.appendChild(div);
  }

  // Page 2 (1–10 again)
  for(let i = 10; i < 20; i++){
    const div = document.createElement("div");
    div.className = "grid-number";

    const number = document.createElement("div");
    number.className = "note-number";
    number.textContent = (i - 9);  // restart numbering 1–10

    const img = document.createElement("img");
    img.src = "../donownotes/" + finalNotes[i];
    img.alt = "Note";

    div.appendChild(number);
    div.appendChild(img);
    page2.appendChild(div);
  }
}

function updatePageIndicator(){
  document.getElementById("pageIndicator").textContent = currentPage;
}

function nextPage(){
  if(currentPage === 1){
    document.getElementById("page1").classList.remove("active");
    document.getElementById("page2").classList.add("active");
    currentPage = 2;
    updatePageIndicator();
  }
}

function prevPage(){
  if(currentPage === 2){
    document.getElementById("page2").classList.remove("active");
    document.getElementById("page1").classList.add("active");
    currentPage = 1;
    updatePageIndicator();
  }
}



function getInputTime(){
  const mins = parseInt(document.getElementById("minutesInput").value) || 0;
  const secs = parseInt(document.getElementById("secondsInput").value) || 0;
  return (mins * 60) + secs;
}

function startTimer(){

  if(isRunning) return;

  if(totalSeconds <= 0){
    totalSeconds = getInputTime();
  }

  if(totalSeconds <= 0) return;

  isRunning = true;

  document.getElementById("startBtn").classList.add("button-active");
  document.getElementById("pauseBtn").classList.remove("button-paused");

  timerInterval = setInterval(()=>{
    if(totalSeconds <= 0){
      clearInterval(timerInterval);
      isRunning = false;
      document.getElementById("startBtn").classList.remove("button-active");
      return;
    }

    totalSeconds--;
    updateDisplay();
  },1000);
}

function pauseTimer(){

  if(!isRunning) return;

  clearInterval(timerInterval);
  isRunning = false;

  document.getElementById("startBtn").classList.remove("button-active");
  document.getElementById("pauseBtn").classList.add("button-paused");
}

function resetTimer(){

  clearInterval(timerInterval);
  isRunning = false;

  totalSeconds = getInputTime();
  updateDisplay();

  document.getElementById("startBtn").classList.remove("button-active");
  document.getElementById("pauseBtn").classList.remove("button-paused");
}

function updateDisplay(){
  const el = document.getElementById("timerDisplay");
  if (!el) return;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  el.textContent =
    String(minutes).padStart(2,"0") +
    ":" +
    String(seconds).padStart(2,"0");
}
document.addEventListener("keydown", e=>{
  if(e.key === "Escape") closeDoNowInline();
});



function toggleOverlayFullscreen(){

  const btn = document.getElementById("fullscreenBtn");

  if (!document.fullscreenElement){
    document.documentElement.requestFullscreen();
    btn.classList.add("button-active");
  } else {
    document.exitFullscreen();
    btn.classList.remove("button-active");
  }
}

document.addEventListener("fullscreenchange", ()=>{
  if(!document.fullscreenElement){
    document.getElementById("fullscreenBtn")
      ?.classList.remove("button-active");
  }
});



document.addEventListener("DOMContentLoaded", () => {

  const mount = document.getElementById("doNowMount");
  if (!mount) return;

  mount.innerHTML = `
    <!-- DO NOW OVERLAY -->
    <div id="doNowOverlay">
      <div class="do-now-wrapper">

        <div class="do-now-header">

          <div class="timer-large">
            <span id="timerDisplay">02:00</span>
          </div>

          <div class="page-indicator">
            Page <span id="pageIndicator">1</span>
          </div>

          <div class="do-now-top-bar">

            <div class="left-controls">
              <button id="startBtn" onclick="startTimer()">Start</button>
              <button id="pauseBtn" onclick="pauseTimer()">Pause</button>
              <button id="resetBtn" onclick="resetTimer()">Reset</button>
              <button id="fullscreenBtn" onclick="toggleOverlayFullscreen()">⛶</button>
            </div>

            <div class="guide-container">
              <img src="../donownotes/guide.svg" alt="Note Guide">
            </div>

            <div class="time-inputs">
              <input type="number" id="minutesInput" min="0" value="2">
              <span>:</span>
              <input type="number" id="secondsInput" min="0" max="59" value="0">
            </div>

          </div>
        </div>

        <div class="grid-container">
          <div class="grid-page active" id="page1"></div>
          <div class="grid-page" id="page2"></div>
        </div>

      </div>

      <div class="page-nav">
        <button onclick="prevPage()">◀</button>
        <button onclick="nextPage()">▶</button>
      </div>
    <button id="doNowCloseBtn" onclick="closeDoNowInline()">Close</button>


    </div>


    <button id="doNowOpenBtn" onclick="openDoNowInline()">Do Now</button>
  `;

  // Now the DOM exists — safe to initialise
  updateDisplay();

});