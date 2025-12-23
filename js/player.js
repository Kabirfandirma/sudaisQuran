/**
 * Sheikh AbdulRahman Al-Sudais Qur'an Audio Player
 * A respectful, distraction-free player for Qur'an recitation
 */

document.addEventListener("DOMContentLoaded", function () {
  // Quran Surah Data
  const surahs = [
    {
      surah: "Al-Fātiḥah",
      number: 1,
      arabic: "الفاتحة",
      translation: "The Opening",
      reciter: "Sheikh AbdulRahman Al-Sudais",
      file: "assets/audio/001-al-fatiha.mp3",
      duration: "1:15",
    },
    {
      surah: "Al-Baqarah",
      number: 2,
      arabic: "البقرة",
      translation: "The Cow",
      reciter: "Sheikh AbdulRahman Al-Sudais",
      file: "assets/audio/002-al-baqarah.mp3",
      duration: "2:30",
    },
    {
      surah: "Āl 'Imrān",
      number: 3,
      arabic: "آل عمران",
      translation: "Family of Imran",
      reciter: "Sheikh AbdulRahman Al-Sudais",
      file: "assets/audio/003-aal-imran.mp3",
      duration: "2:05",
    },
  ];

  // DOM Elements
  const audioPlayer = document.getElementById("quran-audio");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const playPauseIcon = document.getElementById("play-pause-icon");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const progressBar = document.getElementById("progress-bar");
  const currentTimeEl = document.getElementById("current-time");
  const totalDurationEl = document.getElementById("total-duration");
  const volumeControl = document.getElementById("volume-control");
  const autoPlayToggle = document.getElementById("auto-play-toggle");
  const currentSurahName = document.getElementById("current-surah-name");
  const currentSurahDetails = document.getElementById("current-surah-details");
  const surahPlaylist = document.getElementById("surah-playlist");
  const playerStatus = document.getElementById("player-status");
  const lastPlayedEl = document.getElementById("last-played");

  // Player State
  let currentSurahIndex = 0;
  let isPlaying = false;
  let autoPlayEnabled = true;

  // Initialize Player
  function initPlayer() {
    // Load saved state from localStorage
    const savedSurahIndex = localStorage.getItem("sudaisLastSurah");
    const savedVolume = localStorage.getItem("sudaisVolume");
    const savedAutoPlay = localStorage.getItem("sudaisAutoPlay");

    if (savedSurahIndex !== null) {
      currentSurahIndex = parseInt(savedSurahIndex);
      lastPlayedEl.textContent = surahs[currentSurahIndex].surah;
    }

    if (savedVolume !== null) {
      volumeControl.value = savedVolume;
      audioPlayer.volume = savedVolume / 100;
    } else {
      audioPlayer.volume = 0.7; // Default volume
      volumeControl.value = 70;
    }

    if (savedAutoPlay !== null) {
      autoPlayEnabled = savedAutoPlay === "true";
      autoPlayToggle.checked = autoPlayEnabled;
    }

    // Load first surah
    loadSurah(currentSurahIndex);

    // Generate playlist
    renderPlaylist();

    // Update player status
    playerStatus.textContent = "Ready";
  }

  // Load a specific surah
  function loadSurah(index) {
    if (index < 0 || index >= surahs.length) return;

    currentSurahIndex = index;
    const surah = surahs[index];

    // Update audio source
    audioPlayer.src = surah.file;

    // Update UI
    currentSurahName.textContent = surah.surah;
    currentSurahDetails.textContent = `Surah ${surah.number} • ${surah.translation}`;

    // Update playlist highlighting
    updatePlaylistHighlight();

    // Save to localStorage
    localStorage.setItem("sudaisLastSurah", index.toString());
    lastPlayedEl.textContent = surah.surah;

    // Update player status
    playerStatus.textContent = "Loaded: " + surah.surah;

    // When metadata is loaded, update duration
    audioPlayer.addEventListener(
      "loadedmetadata",
      function () {
        totalDurationEl.textContent = formatTime(audioPlayer.duration);
      },
      { once: true }
    );

    // Reset progress bar
    progressBar.value = 0;
    currentTimeEl.textContent = "0:00";
  }

  // Render playlist
  function renderPlaylist() {
    surahPlaylist.innerHTML = "";

    surahs.forEach((surah, index) => {
      const li = document.createElement("li");
      li.className = `surah-item p-3 rounded-lg cursor-pointer transition ${
        index === currentSurahIndex
          ? "bg-blue-50 border border-blue-200"
          : "hover:bg-gray-100"
      }`;
      li.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <div class="font-medium text-gray-800">${surah.surah}</div>
                        <div class="text-sm text-gray-600">${surah.translation} • ${surah.duration}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-bold text-[#1a5f7a]">${surah.number}</div>
                        <div class="text-xs text-gray-500">Surah</div>
                    </div>
                </div>
            `;

      li.addEventListener("click", () => {
        loadSurah(index);
        playSurah();
      });

      surahPlaylist.appendChild(li);
    });
  }

  // Update playlist highlight
  function updatePlaylistHighlight() {
    const items = document.querySelectorAll(".surah-item");
    items.forEach((item, index) => {
      if (index === currentSurahIndex) {
        item.className =
          "surah-item p-3 rounded-lg cursor-pointer transition bg-blue-50 border border-blue-200";
      } else {
        item.className =
          "surah-item p-3 rounded-lg cursor-pointer transition hover:bg-gray-100";
      }
    });
  }

  // Play/pause functionality
  function togglePlayPause() {
    if (audioPlayer.src === "") {
      loadSurah(currentSurahIndex);
    }

    if (isPlaying) {
      pauseSurah();
    } else {
      playSurah();
    }
  }

  function playSurah() {
    audioPlayer
      .play()
      .then(() => {
        isPlaying = true;
        playPauseIcon.className = "fas fa-pause text-2xl";
        playPauseBtn.classList.add("playing");
        playerStatus.textContent =
          "Playing: " + surahs[currentSurahIndex].surah;
      })
      .catch((error) => {
        console.error("Playback failed:", error);
        playerStatus.textContent = "Playback error";
      });
  }

  function pauseSurah() {
    audioPlayer.pause();
    isPlaying = false;
    playPauseIcon.className = "fas fa-play text-2xl";
    playPauseBtn.classList.remove("playing");
    playerStatus.textContent = "Paused";
  }

  // Next/previous surah
  function nextSurah() {
    if (currentSurahIndex < surahs.length - 1) {
      loadSurah(currentSurahIndex + 1);
      playSurah();
    } else {
      // If at last surah, stop playback
      pauseSurah();
      playerStatus.textContent = "Reached end of playlist";
    }
  }

  function prevSurah() {
    if (currentSurahIndex > 0) {
      loadSurah(currentSurahIndex - 1);
      playSurah();
    } else {
      // If at first surah, restart it
      audioPlayer.currentTime = 0;
      playerStatus.textContent = "Restarted surah";
    }
  }

  // Format time from seconds to MM:SS
  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  // Update progress bar as audio plays
  function updateProgress() {
    if (!isNaN(audioPlayer.duration)) {
      const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressBar.value = progress;
      currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }
  }

  // Seek functionality
  function seekAudio() {
    const seekTime = (progressBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
  }

  // Volume control
  function updateVolume() {
    const volume = volumeControl.value / 100;
    audioPlayer.volume = volume;
    localStorage.setItem("sudaisVolume", volumeControl.value);
  }

  // Auto-play next surah when current ends
  function handleAudioEnd() {
    if (autoPlayEnabled && currentSurahIndex < surahs.length - 1) {
      nextSurah();
    } else if (autoPlayEnabled && currentSurahIndex === surahs.length - 1) {
      pauseSurah();
      playerStatus.textContent = "Playback completed";
    }
  }

  // Toggle auto-play
  function toggleAutoPlay() {
    autoPlayEnabled = autoPlayToggle.checked;
    localStorage.setItem("sudaisAutoPlay", autoPlayEnabled.toString());
    playerStatus.textContent = `Auto-play: ${
      autoPlayEnabled ? "Enabled" : "Disabled"
    }`;
  }

  // Event Listeners
  playPauseBtn.addEventListener("click", togglePlayPause);
  prevBtn.addEventListener("click", prevSurah);
  nextBtn.addEventListener("click", nextSurah);

  progressBar.addEventListener("input", seekAudio);
  audioPlayer.addEventListener("timeupdate", updateProgress);

  volumeControl.addEventListener("input", updateVolume);
  autoPlayToggle.addEventListener("change", toggleAutoPlay);

  audioPlayer.addEventListener("ended", handleAudioEnd);

  // Keyboard shortcuts for better accessibility
  document.addEventListener("keydown", function (event) {
    // Space bar to play/pause
    if (
      event.code === "Space" &&
      !event.target.matches("input, button, textarea")
    ) {
      event.preventDefault();
      togglePlayPause();
    }

    // Arrow keys for previous/next
    if (event.code === "ArrowLeft") {
      event.preventDefault();
      if (event.ctrlKey) {
        prevSurah();
      } else {
        audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
      }
    }

    if (event.code === "ArrowRight") {
      event.preventDefault();
      if (event.ctrlKey) {
        nextSurah();
      } else {
        audioPlayer.currentTime = Math.min(
          audioPlayer.duration,
          audioPlayer.currentTime + 10
        );
      }
    }

    // Volume up/down
    if (event.code === "ArrowUp" && event.ctrlKey) {
      event.preventDefault();
      volumeControl.value = Math.min(100, parseInt(volumeControl.value) + 10);
      updateVolume();
    }

    if (event.code === "ArrowDown" && event.ctrlKey) {
      event.preventDefault();
      volumeControl.value = Math.max(0, parseInt(volumeControl.value) - 10);
      updateVolume();
    }
  });

  // Initialize the player
  initPlayer();
});
