const keys = document.querySelectorAll(".piano-keys");
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const activeNotes = {}; // Object to keep track of active audio objects

keys.forEach((key) => {
  key.addEventListener("click", (e) => {
    const clickedKey = e.target.dataset.list;
    console.log(`Mouse click on key: ${clickedKey}`);

    // Resume the audio context if it's suspended
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    // Create a new Audio object for each key press
    playSound(clickedKey);
  });
});

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
  console.error("WebMIDI is not supported in this browser.");
}

function onMIDISuccess(midiAccess) {
  console.log("MIDI Access Object", midiAccess);
  for (let input of midiAccess.inputs.values()) {
    input.onmidimessage = getMIDIMessage;
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

  // Resume the audio context if it's suspended
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

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

function playSound(keyId) {
  const audioUrl = `./KeySounds/key${keyId}.mp3`;
  fetch(audioUrl)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
    .then((audioBuffer) => {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;

      const gainNode = audioContext.createGain();
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.setValueAtTime(1, audioContext.currentTime); // Initial volume

      source.start();
      return { source, gainNode };
    })
    .then(({ source, gainNode }) => {
      // Store the audio source and gain node in the activeNotes object
      activeNotes[keyId] = { source, gainNode };
    })
    .catch((e) => console.error(e));
}

function noteOn(note, velocity) {
  console.log(`Note on: ${note} (velocity: ${velocity})`);
  const keyId = keyMapping[note];
  if (keyId) {
    const key = document.querySelector(`[data-list="${keyId}"]`);
    if (key) {
      key.classList.add("highlight");
      console.log(`Key highlighted: ${keyId}`);

      // Play the sound using the Web Audio API
      playSound(keyId);
    } else {
      console.error(`No key found for keyId: ${keyId}`);
    }
  } else {
    console.error(`No mapping found for note: ${note}`);
  }
}

function noteOff(note) {
  console.log(`Note off: ${note}`);
  const keyId = keyMapping[note];
  if (keyId) {
    const key = document.querySelector(`[data-list="${keyId}"]`);
    if (key) {
      key.classList.remove("highlight");
      console.log(`Key highlight removed: ${keyId}`);

      // Stop the audio associated with this note
      if (activeNotes[keyId]) {
        const { source, gainNode } = activeNotes[keyId];
        const currentTime = audioContext.currentTime;
        const releaseTime = 0.75; // Adjust this value for a longer release time
        gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          currentTime + releaseTime
        ); // Gradual release to avoid clicking
        source.stop(currentTime + releaseTime); // Stop the sound after the release time
        delete activeNotes[keyId];
      }
    } else {
      console.error(`No key found for keyId: ${keyId}`);
    }
  } else {
    console.error(`No mapping found for note: ${note}`);
  }
}

// Function to stop all active sounds
function stopAllSounds() {
  for (const keyId in activeNotes) {
    if (activeNotes.hasOwnProperty(keyId)) {
      const { source, gainNode } = activeNotes[keyId];
      const currentTime = audioContext.currentTime;
      gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.1); // Quick fade out
      source.stop(currentTime + 0.1); // Stop the sound after the quick fade out
      delete activeNotes[keyId];
    }
  }
}

// Attach the stopAllSounds function to the stop button
document.getElementById("stopButton").addEventListener("click", stopAllSounds);
