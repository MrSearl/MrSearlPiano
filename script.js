let currentlyFullscreen = null;

document.querySelectorAll(".custom-audio-player").forEach((player) => {
  const audio = player.querySelector(".audio-element");
  const playPauseBtn = player.querySelector(".play-pause-btn");
  const seekBar = player.querySelector(".seek-bar");
  const volumeControl = player.querySelector(".volume-control");

  // Toggle Play/Pause
  playPauseBtn.addEventListener("click", () => {
    if (audio.paused) {
      // Pause all other players first
      document.querySelectorAll("audio").forEach((a) => {
        if (a !== audio) a.pause();
      });

      audio.play();
      playPauseBtn.textContent = "⏸️";
    } else {
      audio.pause();
      playPauseBtn.textContent = "▶️";
    }
  });

  // Update Seek Bar
  audio.addEventListener("timeupdate", () => {
    seekBar.value = audio.currentTime;
    seekBar.max = audio.duration || 0;
  });

  // Seek on input
  seekBar.addEventListener("input", () => {
    audio.currentTime = seekBar.value;
  });

  // Volume control
  volumeControl.addEventListener("input", () => {
    audio.volume = volumeControl.value;
  });

  // Reset button text when audio ends
  audio.addEventListener("ended", () => {
    playPauseBtn.textContent = "▶️ Play";
  });
});

function updateButtonState() {
  const prevButton = document.querySelectorAll(".arrow-button")[0];
  const nextButton = document.querySelectorAll(".arrow-button")[1];
  prevButton.disabled = currentSectionIndex === 0;
  nextButton.disabled = currentSectionIndex === sections.length - 1;
}

function scrollToNext() {
  if (currentSectionIndex < sections.length - 1) {
    currentSectionIndex++;
    sections[currentSectionIndex].scrollIntoView({ behavior: "smooth" });
    updateButtonState();
  }
}

function scrollToPrev() {
  if (currentSectionIndex > 0) {
    currentSectionIndex--;
    sections[currentSectionIndex].scrollIntoView({ behavior: "smooth" });
    updateButtonState();
  }
}

// updateButtonState();

// piano stuff

// // Import Tone.js (you can skip this if you've already included Tone.js via a CDN or npm package)
// import * as Tone from "tone";

// Initialize the sampler for all the keys (assuming each key has a corresponding sample)
const sampler = new Tone.Sampler({
  urls: {
    C1: "../KeySounds/key01.mp3",
    "C#1": "../KeySounds/key02.mp3",
    D1: "../KeySounds/key03.mp3",
    "D#1": "../KeySounds/key04.mp3",
    E1: "../KeySounds/key05.mp3",
    F1: "../KeySounds/key06.mp3",
    "F#1": "../KeySounds/key07.mp3",
    G1: "../KeySounds/key08.mp3",
    "G#1": "../KeySounds/key09.mp3",
    A1: "../KeySounds/key10.mp3",
    "A#1": "../KeySounds/key11.mp3",
    B1: "../KeySounds/key12.mp3",
    C2: "../KeySounds/key13.mp3",
    "C#2": "../KeySounds/key14.mp3",
    D2: "../KeySounds/key15.mp3",
    "D#2": "../KeySounds/key16.mp3",
    E2: "../KeySounds/key17.mp3",
    F2: "../KeySounds/key18.mp3",
    "F#2": "../KeySounds/key19.mp3",
    G2: "../KeySounds/key20.mp3",
    "G#2": "../KeySounds/key21.mp3",
    A2: "../KeySounds/key22.mp3",
    "A#2": "../KeySounds/key23.mp3",
    B2: "../KeySounds/key24.mp3",
    C3: "../KeySounds/key25.mp3",
    "C#3": "../KeySounds/key26.mp3",
    D3: "../KeySounds/key27.mp3",
    "D#3": "../KeySounds/key28.mp3",
    E3: "../KeySounds/key29.mp3",
  },
  release: 1,
  baseUrl: "./", // This is the directory where your samples are stored
}).toDestination(); // Connect the sampler to the output destination (i.e., speakers)

const keys = document.querySelectorAll(".piano-keys");
const activeNotes = {}; // Object to keep track of active notes

document.getElementById("startButton").addEventListener("click", () => {
  console.log("Button clicked");
  // Start the audio context and initialize Tone.js
  Tone.start().then(() => {
    console.log("Tone.js Audio Context started");
  });

  // Disable the button after starting the audio context
  document.getElementById("startButton").disabled = true;
});

keys.forEach((key) => {
  key.addEventListener("mousedown", (e) => {
    const clickedKey = e.target.dataset.list;
    console.log(`Mouse down on key: ${clickedKey}`);
    const toneNote = mapKeyToTone(clickedKey);
    if (toneNote) {
      sampler.triggerAttack(toneNote); // Start the note
      activeNotes[clickedKey] = toneNote;

      // Add highlight class to the key
      e.target.classList.add("highlight");
    }
  });

  key.addEventListener("mouseup", (e) => {
    const clickedKey = e.target.dataset.list;
    console.log(`Mouse up on key: ${clickedKey}`);
    if (activeNotes[clickedKey]) {
      sampler.triggerRelease(activeNotes[clickedKey]); // Release the note
      delete activeNotes[clickedKey];

      // Remove highlight class from the key
      e.target.classList.remove("highlight");
    }
  });

  // Handle mouse leaving the key during hold
  key.addEventListener("mouseleave", (e) => {
    const clickedKey = e.target.dataset.list;
    if (activeNotes[clickedKey]) {
      sampler.triggerRelease(activeNotes[clickedKey]);
      delete activeNotes[clickedKey];

      // Remove highlight class when mouse leaves
      e.target.classList.remove("highlight");
    }
  });
});

// MIDI handling
if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
  console.error("WebMIDI is not supported in this browser.");
}

function onMIDISuccess(midiAccess) {
  console.log("MIDI Access Object", midiAccess);
  const midiStatus = document.getElementById("midiStatus");
  let keyboardConnected = false;

  for (let input of midiAccess.inputs.values()) {
    if (input.name) {
      midiStatus.textContent = `Keyboard connected`;
      keyboardConnected = true;
    }
    input.onmidimessage = getMIDIMessage;
  }

  if (!keyboardConnected) {
    midiStatus.textContent = "No keyboard connected";
  }
}
function onMIDIFailure() {
  console.error("Could not access your MIDI devices.");
}

function getMIDIMessage(midiMessage) {
  const [command, note, velocity] = midiMessage.data;
  console.log(
    `MIDI message received: command=${command}, note=${note}, velocity=${velocity}`
  );

  switch (command) {
    case 144: // Note on
      if (velocity > 0) {
        noteOn(note, velocity);
      } else {
        noteOff(note);
      }
      break;
    case 128: // Note off
      noteOff(note);
      break;
    default:
      break;
  }
}

const keyMapping = {
  48: "01",
  49: "02",
  50: "03",
  51: "04",
  52: "05",
  53: "06",
  54: "07",
  55: "08",
  56: "09",
  57: "10",
  58: "11",
  59: "12",
  60: "13",
  61: "14",
  62: "15",
  63: "16",
  64: "17",
  65: "18",
  66: "19",
  67: "20",
  68: "21",
  69: "22",
  70: "23",
  71: "24",
  72: "25",
  73: "26",
  74: "27",
  75: "28",
  76: "29",
};

function noteOn(note, velocity) {
  console.log(`Note on: ${note} (velocity: ${velocity})`);
  const keyId = keyMapping[note];
  if (keyId) {
    const toneNote = mapKeyToTone(keyId);
    if (toneNote) {
      // Store the note to track it
      activeNotes[note] = toneNote;

      // Use triggerAttack instead of triggerAttackRelease
      // This starts the note without scheduling its end
      sampler.triggerAttack(toneNote, Tone.now(), velocity / 127);

      // Highlight the key visually
      const keyElement = document.querySelector(
        `.piano-keys[data-list="${keyId}"]`
      );
      if (keyElement) {
        keyElement.classList.add("highlight");
      }
    }
  }
}

function noteOff(note) {
  console.log(`Note off: ${note}`);
  const keyId = keyMapping[note];
  if (keyId) {
    // Get the tone note that was previously triggered
    const toneNote = activeNotes[note];
    if (toneNote) {
      // Release the note
      sampler.triggerRelease(toneNote);
      // Remove from active notes
      delete activeNotes[note];

      // Remove visual highlight
      const keyElement = document.querySelector(
        `.piano-keys[data-list="${keyId}"]`
      );
      if (keyElement) {
        keyElement.classList.remove("highlight");
      }
    }
  }
}

function mapKeyToTone(keyId) {
  const toneMapping = {
    "01": "C1",
    "02": "C#1",
    "03": "D1",
    "04": "D#1",
    "05": "E1",
    "06": "F1",
    "07": "F#1",
    "08": "G1",
    "09": "G#1",
    10: "A1",
    11: "A#1",
    12: "B1",
    13: "C2",
    14: "C#2",
    15: "D2",
    16: "D#2",
    17: "E2",
    18: "F2",
    19: "F#2",
    20: "G2",
    21: "G#2",
    22: "A2",
    23: "A#2",
    24: "B2",
    25: "C3",
    26: "C#3",
    27: "D3",
    28: "D#3",
    29: "E3",
  };

  return toneMapping[keyId];
}

// Stop all sounds and remove all highlights
function stopAllSounds() {
  sampler.releaseAll();

  // Remove highlights from all keys
  document.querySelectorAll(".piano-keys").forEach((key) => {
    key.classList.remove("highlight");
  });

  // Clear the active notes object
  Object.keys(activeNotes).forEach((key) => {
    delete activeNotes[key];
  });
}

document.getElementById("stopButton").addEventListener("click", stopAllSounds);

// Add a window event listener to release all notes when the page is closed or refreshed
window.addEventListener("beforeunload", stopAllSounds);

function toggleFullScreen(button) {
  const container = button.closest("[data-fullscreen-container]");
  const isKeyboard = container.classList.contains("keyboard");
  const isWhiteboard = container.classList.contains("wb");
  const piano = container.querySelector(".piano-container");
  const notationHeading = document.querySelector(".notation-heading");

  console.log("🔲 Toggle button clicked");
  console.log("Current container classes:", container.className);

  const enteringFullscreen = !document.fullscreenElement;

  if (enteringFullscreen) {
    console.log("⛶ Attempting to enter fullscreen...");
    container
      .requestFullscreen()
      .then(() => {
        console.log("✅ Entered fullscreen");
        container.classList.add("fullscreen-active");
        currentlyFullscreen = container;

        if (isKeyboard && piano) {
          piano.classList.add("fullscreen-scale");
          console.log("🎹 Piano scaled up");
        }

        if (notationHeading) {
          notationHeading.classList.add("fullscreen-notation");
          console.log("🎼 Notation scaled up");
        }
      })
      .catch((err) => {
        console.error("❌ Error entering fullscreen:", err);
      });
  } else {
    console.log("↩️ Exiting fullscreen...");
    document
      .exitFullscreen()
      .then(() => {
        console.log("✅ Successfully exited fullscreen");

        if (isWhiteboard) {
          container.className = "wb";
          console.log("✅ Reset class to 'wb'");
        } else {
          container.classList.remove("fullscreen-active");
          console.log("✅ Removed 'fullscreen-active' from non-wb");
        }

        if (isKeyboard && piano) {
          piano.classList.remove("fullscreen-scale");
          console.log("🎹 Removed piano scale");
        }

        if (notationHeading) {
          notationHeading.classList.remove("fullscreen-notation");
          console.log("🎼 Removed notation scale");
        }

        currentlyFullscreen = null;
      })
      .catch((err) => {
        console.error("❌ Failed to exit fullscreen:", err);
      });
  }
}

document.addEventListener("fullscreenchange", () => {
  console.log("📣 fullscreenchange event fired");

  if (!document.fullscreenElement) {
    const container =
      currentlyFullscreen || document.querySelector(".fullscreen-active");

    if (!container) {
      console.log("⚠️ No active fullscreen container found");
      return;
    }

    console.log("📦 Found container to reset:", container.className);

    if (container.classList.contains("wb")) {
      container.className = "wb";
      console.log("✅ Reset class to 'wb'");
    } else {
      container.classList.remove("fullscreen-active");
      console.log("✅ Removed 'fullscreen-active' class");
    }

    const piano = container.querySelector(".piano-container");
    if (piano) {
      piano.classList.remove("fullscreen-scale");
      console.log("🎹 Removed piano scale");
    }

    const notationHeading = document.querySelector(".notation-heading");
    if (notationHeading) {
      notationHeading.classList.remove("fullscreen-notation");
      console.log("🎼 Removed notation scale");
    }

    currentlyFullscreen = null;
    console.log("🧹 Cleared currentlyFullscreen");
  }
});
