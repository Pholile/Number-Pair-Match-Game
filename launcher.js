//==================Form for GAME SETTINGD==========================================

//getting elements for the game's setting

const playerName = document.getElementById("playerName");
const boardSize = document.getElementById("boardSize");
const difficulty = document.getElementById("difficulty");
const pairType = document.querySelectorAll('input[name="pairType"]');
const showTimer = document.getElementById("showTimer");
const enableHints = document.getElementById("enableHints");
const shuffleAnimation = document.getElementById("shuffleAnimation");

// for showing a preview of the settings
const previewText = document.getElementById("previewText");

//=================Preview of the settings====================

//using event listeners to update the preview text whenever a setting is changed

playerName.addEventListener("input", updatePreview);
boardSize.addEventListener("change", updatePreview);
difficulty.addEventListener("change", updatePreview);
pairType.forEach((radio) => radio.addEventListener("change", updatePreview));
showTimer.addEventListener("change", updatePreview);
enableHints.addEventListener("change", updatePreview);
shuffleAnimation.addEventListener("change", updatePreview);
//eventListener add up to 7

//==========================Updating the preview text===================
//showing the preview of the settings in the preview text element
function updatePreview() {
  const name = playerName.value || "Player";
  const board = boardSize.value || "4 x 4";
  const diff = difficulty.value || "Medium";
  const pair =
    Array.from(pairType).find((radio) => radio.checked)?.value || "Numbers";
  const time = showTimer.checked ? "Enabled" : "Disabled";
  const hints = enableHints.checked ? "Enabled" : "Disabled";
  const shuffle = shuffleAnimation.checked ? "Enabled" : "Disabled";

  //preview will show in a row like formate, and if the player name is empty, it will show "Player" as default
  //Each setting should show on a new line.

  //innerHTML worked for the display of the preview settings on different lines
  previewText.innerHTML = `
        Player Name: ${name}
        </br> |
        Board Size: ${board} 
        </br> |
        Difficulty Level: ${diff}
        </br> |
        Pair Type: ${pair} 
        </br> |
        Hints: ${hints}
        </br> |
        Timer: ${time} 
        </br> |
        Shuffle Animation: ${shuffle}
 `;
}

//these setting should be saved to the local storage, and showing a message if it has been saved
//============Save Settings===================
const saveButton = document.getElementById("saveSettingsBtn");
saveButton.addEventListener("click", () => {
  const settings = {
    playerName: playerName.value,
    boardSize: boardSize.value,
    difficulty: difficulty.value,
    pairType:
      Array.from(pairType).find((radio) => radio.checked)?.value || "Numbers",
    showTimer: showTimer.checked,
    enableHints: enableHints.checked,
    shuffleAnimation: shuffleAnimation.checked,
  };
  localStorage.setItem("gameSavedSettings", JSON.stringify(settings));
  alert("Settings saved successfully!");
});

//===========Loading EXISTING settings====================
//when loadsettings is clicked the saved setting will show in preview, if the are no saved setting is will show "no saved setting please enter settings"
const loadButton = document.getElementById("loadSettingsBtn"); //don't use loadBTN again, refernce game5
loadButton.addEventListener("click", () => {
  const savedSettings = JSON.parse(localStorage.getItem("gameSavedSettings"));
  if (savedSettings) {
    playerName.value = savedSettings.playerName;
    boardSize.value = savedSettings.boardSize;
    difficulty.value = savedSettings.difficulty;
    pairType.forEach((radio) => {
      if (radio.value === savedSettings.pairType) {
        radio.checked = true;
      }
    });
    showTimer.checked = savedSettings.showTimer;
    enableHints.checked = savedSettings.enableHints;
    shuffleAnimation.checked = savedSettings.shuffleAnimation;
    updatePreview();
  } else {
    alert("No saved settings found. Please enter your settings.");
  }
});

//==========================Reseting save settings===============
//remove from LS then show the default settings in the preview, msg "setting are defualt, enter new settingd"

const resetButton = document.getElementById("resetSettingsBtn");
resetButton.addEventListener("click", () => {
  localStorage.removeItem("gameSavedSettings");
  playerName.value = "";
  boardSize.value = "4x4";
  difficulty.value = "Medium";
  pairType.forEach((radio) => (radio.checked = false));
  showTimer.checked = false;
  enableHints.checked = false;
  shuffleAnimation.checked = false;

  //preview changes back
  updatePreview();
  alert("Settings reset to default. Please enter new settings.");
});

//===================Open GAme with latest saved settings===========
const startGameBtn = document.getElementById("openGameBtn");
startGameBtn.addEventListener("click", () => {
  const settings = {
    playerName: playerName.value,
    boardSize: boardSize.value,
    difficulty: difficulty.value,
    pairType:
      Array.from(pairType).find((radio) => radio.checked)?.value || "Numbers",
    showTimer: showTimer.checked,
    enableHints: enableHints.checked,
    shuffleAnimation: shuffleAnimation.checked,
  };
  localStorage.setItem("gameSavedSettings", JSON.stringify(settings));
  window.location.href = "game.html"; //js cont on game.js
});
