/**
 * Sheikh AbdulRahman Al-Sudais Qur'an Audio Player
 * Clean, respectful interface for Qur'an recitation
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
  let updateProgressInterval;

  // Initialize Player
  function initPlayer() {
    // Load saved state from localStorage
    const savedSurahIndex = localStorage.getItem("sudaisLastSurah");
    const savedVolume = localStorage.getItem("sudaisVolume");
    const savedAutoPlay = localStorage.getItem("sudaisAutoPlay");

    if (savedSurahIndex !== null && !isNaN(savedSurahIndex)) {
      currentSurahIndex = parseInt(savedSurahIndex);
      if (currentSurahIndex >= 0 && currentSurahIndex < surahs.length) {
        lastPlayedEl.textContent = surahs[currentSurahIndex].surah;
      }
    }

    if (savedVolume !== null) {
      const volumeValue = parseInt(savedVolume);
      if (!isNaN(volumeValue) && volumeValue >= 0 && volumeValue <= 100) {
        volumeControl.value = volumeValue;
        audioPlayer.volume = volumeValue / 100;
      }
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
    updatePlayerStatus("Ready to play");
  }

  // Load a specific surah
  function loadSurah(index) {
    if (index < 0 || index >= surahs.length) return;

    currentSurahIndex = index;
    const surah = surahs[index];

    // Pause current playback
    if (isPlaying) {
      pauseSurah();
    }

    // Update audio source
    audioPlayer.src = surah.file;

    // Update UI
    currentSurahName.textContent = surah.surah;
    currentSurahDetails.innerHTML = `<span class="text-cyan-700 font-medium">Surah ${surah.number}</span> • ${surah.translation}`;

    // Update playlist highlighting
    updatePlaylistHighlight();

    // Save to localStorage
    localStorage.setItem("sudaisLastSurah", index.toString());
    lastPlayedEl.textContent = surah.surah;

    // Update player status
    updatePlayerStatus(`Loaded: ${surah.surah}`);

    // When metadata is loaded, update duration
    audioPlayer.addEventListener(
      "loadedmetadata",
      function () {
        if (!isNaN(audioPlayer.duration) && audioPlayer.duration > 0) {
          totalDurationEl.textContent = formatTime(audioPlayer.duration);
        } else {
          totalDurationEl.textContent = surah.duration || "--:--";
        }
      },
      { once: true }
    );

    // Reset progress bar
    progressBar.value = 0;
    currentTimeEl.textContent = "0:00";

    // Clear any existing interval
    if (updateProgressInterval) {
      clearInterval(updateProgressInterval);
    }
  }

  // Render playlist
  function renderPlaylist() {
    surahPlaylist.innerHTML = "";

    surahs.forEach((surah, index) => {
      const li = document.createElement("li");
      li.className = `playlist-item p-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent ${
        index === currentSurahIndex ? "current-playing" : ""
      }`;
      li.innerHTML = `
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                      index === currentSurahIndex
                        ? "bg-cyan-100 text-cyan-700"
                        : "bg-gray-100 text-gray-600"
                    }">
                        <span class="font-semibold">${surah.number}</span>
                    </div>
                    <div class="flex-1">
                        <div class="font-medium text-gray-900">${
                          surah.surah
                        }</div>
                        <div class="text-sm text-gray-500">${
                          surah.translation
                        }</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-400">${
                          surah.duration
                        }</div>
                        ${
                          index === currentSurahIndex
                            ? '<div class="w-2 h-2 rounded-full bg-cyan-500 mt-1 ml-auto"></div>'
                            : ""
                        }
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
    const items = document.querySelectorAll(".playlist-item");
    items.forEach((item, index) => {
      if (index === currentSurahIndex) {
        item.classList.add("current-playing");
        item.classList.remove("border-transparent");
      } else {
        item.classList.remove("current-playing");
        item.classList.add("border-transparent");
      }
    });
  }

  // Update player status
  function updatePlayerStatus(status) {
    playerStatus.textContent = status;
  }

  // Play/pause functionality
  function togglePlayPause() {
    if (audioPlayer.src === "" || audioPlayer.src.includes("undefined")) {
      loadSurah(currentSurahIndex);
    }

    if (isPlaying) {
      pauseSurah();
    } else {
      playSurah();
    }
  }

  function playSurah() {
    // Ensure audio is loaded
    if (!audioPlayer.src || audioPlayer.src.includes("undefined")) {
      loadSurah(currentSurahIndex);
    }

    const playPromise = audioPlayer.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isPlaying = true;
          playPauseIcon.className = "fas fa-pause text-2xl md:text-3xl";
          updatePlayerStatus(`Playing: ${surahs[currentSurahIndex].surah}`);

          // Start progress updates
          startProgressUpdates();
        })
        .catch((error) => {
          console.error("Playback failed:", error);
          updatePlayerStatus("Click to play");
        });
    }
  }

  function pauseSurah() {
    audioPlayer.pause();
    isPlaying = false;
    playPauseIcon.className = "fas fa-play text-2xl md:text-3xl ml-1";
    updatePlayerStatus("Paused");

    // Stop progress updates
    if (updateProgressInterval) {
      clearInterval(updateProgressInterval);
    }
  }

  // Start updating progress
  function startProgressUpdates() {
    if (updateProgressInterval) {
      clearInterval(updateProgressInterval);
    }

    updateProgressInterval = setInterval(updateProgress, 500);
  }

  // Next/previous surah
  function nextSurah() {
    if (currentSurahIndex < surahs.length - 1) {
      loadSurah(currentSurahIndex + 1);
      playSurah();
    } else {
      // If at last surah, stop playback
      pauseSurah();
      updatePlayerStatus("End of playlist");
    }
  }

  function prevSurah() {
    if (currentSurahIndex > 0) {
      loadSurah(currentSurahIndex - 1);
      playSurah();
    } else {
      // If at first surah, restart it
      audioPlayer.currentTime = 0;
      updatePlayerStatus("Restarted surah");
      if (!isPlaying) {
        playSurah();
      }
    }
  }

  // Format time from seconds to MM:SS
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  // Update progress bar as audio plays
  function updateProgress() {
    if (!isNaN(audioPlayer.duration) && audioPlayer.duration > 0) {
      const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressBar.value = progress;
      currentTimeEl.textContent = formatTime(audioPlayer.currentTime);

      // Update total duration if not set
      if (
        totalDurationEl.textContent === "0:00" ||
        totalDurationEl.textContent === "NaN:NaN"
      ) {
        totalDurationEl.textContent = formatTime(audioPlayer.duration);
      }
    }
  }

  // Seek functionality
  function seekAudio() {
    if (!isNaN(audioPlayer.duration) && audioPlayer.duration > 0) {
      const seekTime = (progressBar.value / 100) * audioPlayer.duration;
      audioPlayer.currentTime = seekTime;
    }
  }

  // Volume control
  function updateVolume() {
    const volume = parseInt(volumeControl.value) / 100;
    if (!isNaN(volume) && volume >= 0 && volume <= 1) {
      audioPlayer.volume = volume;
      localStorage.setItem("sudaisVolume", volumeControl.value);
    }
  }

  // Auto-play next surah when current ends
  function handleAudioEnd() {
    if (autoPlayEnabled && currentSurahIndex < surahs.length - 1) {
      setTimeout(() => {
        nextSurah();
      }, 500);
    } else if (autoPlayEnabled && currentSurahIndex === surahs.length - 1) {
      pauseSurah();
      updatePlayerStatus("Playback completed");
    }
  }

  // Toggle auto-play
  function toggleAutoPlay() {
    autoPlayEnabled = autoPlayToggle.checked;
    localStorage.setItem("sudaisAutoPlay", autoPlayEnabled.toString());
    updatePlayerStatus(
      `Auto-play: ${autoPlayEnabled ? "Enabled" : "Disabled"}`
    );
  }

  // Event Listeners
  playPauseBtn.addEventListener("click", togglePlayPause);
  prevBtn.addEventListener("click", prevSurah);
  nextBtn.addEventListener("click", nextSurah);

  progressBar.addEventListener("input", seekAudio);
  progressBar.addEventListener("change", seekAudio);

  volumeControl.addEventListener("input", updateVolume);
  autoPlayToggle.addEventListener("change", toggleAutoPlay);

  audioPlayer.addEventListener("ended", handleAudioEnd);

  // Keyboard shortcuts for better accessibility
  document.addEventListener("keydown", function (event) {
    // Ignore if user is typing in an input field
    if (event.target.matches("input, textarea, select")) return;

    // Space bar to play/pause
    if (event.code === "Space") {
      event.preventDefault();
      togglePlayPause();
    }

    // Arrow keys for previous/next
    if (event.code === "ArrowLeft") {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        prevSurah();
      } else {
        audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
      }
    }

    if (event.code === "ArrowRight") {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        nextSurah();
      } else {
        if (!isNaN(audioPlayer.duration)) {
          audioPlayer.currentTime = Math.min(
            audioPlayer.duration,
            audioPlayer.currentTime + 10
          );
        }
      }
    }

    // Volume up/down
    if (event.code === "ArrowUp" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      volumeControl.value = Math.min(100, parseInt(volumeControl.value) + 10);
      updateVolume();
    }

    if (event.code === "ArrowDown" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      volumeControl.value = Math.max(0, parseInt(volumeControl.value) - 10);
      updateVolume();
    }

    // Mute with 'm' key
    if (event.code === "KeyM") {
      event.preventDefault();
      if (audioPlayer.volume > 0) {
        localStorage.setItem("sudaisLastVolume", volumeControl.value);
        volumeControl.value = 0;
        updateVolume();
      } else {
        const lastVolume = localStorage.getItem("sudaisLastVolume") || 70;
        volumeControl.value = lastVolume;
        updateVolume();
      }
    }
  });

  // Handle page visibility changes
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && isPlaying) {
      // Optionally pause when tab is hidden
      // pauseSurah();
    }
  });

  // Initialize the player
  initPlayer();

  // Add CSS for current playing item
  const style = document.createElement("style");
  style.textContent = `
        .playlist-item.current-playing {
            background-color: #f0f9ff !important;
            border-color: #bae6fd !important;
            border-left-width: 4px !important;
            border-left-color: #0e7490 !important;
            padding-left: 12px !important;
        }
        
        #play-pause-btn.playing {
            background: linear-gradient(to right, #0891b2, #0e7490) !important;
        }
    `;
  document.head.appendChild(style);
});
