/* GAME.JS */

//using th 'el ' to identify and ref the elements(in game 6 and 8)
let movesCount = 0,
  matchesFound = 0,
  pairsRemaining = 0,
  currentScore = 0,
  elapsedSeconds = 0;

let gameTimerInterval = null,
  cardFlipUno = null,
  cardFlipTwo = null,
  isBoardLocked = false;

const el = (id) => document.getElementById(id);


//string config for the cookie
//under yt SS2 saves
function saveGameCookie(name, value) {
  let cookieTT = name + "=" + value;

  let days = 10;
  let secondsEEveryDAY = 864000;
  let maxTT = days * secondsEEveryDAY;
  cookieTT += ";maxTT=" + maxTT;
  cookieTT += ";path=/";
  document.cookie = cookieTT;
}

//getting the game for the reload
const retrieveGameCookie = (n) =>
  document.cookie
    .split("; ")
    .find((r) => r.startsWith(n + "="))
    ?.split("=")[1] || "";

//====================loading the html===============
//html musy have saved settings from the luancher
window.onload = () => {
  //from gmae 3, yt version
  const cfg = JSON.parse(localStorage.getItem("gameSavedSettings") || "{}");
  if (cfg.playerName) {
    el("displayPlayer").innerHTML = cfg.playerName;
    el("displayBoardSize").innerHTML = cfg.boardSize;
    el("displayDifficulty").innerHTML =
      cfg.difficulty.charAt(0).toUpperCase() + cfg.difficulty.slice(1);
    el("displayPairType").innerHTML = cfg.pairType;
  }
  el("displayBestScore").innerHTML = retrieveGameCookie("bestScore") || "120";
};


//timer setting for the game, once the startGame button is pushed
//after start is pressed, onot when the first
const startTimer = () => {
  clearInterval(gameTimerInterval);
  gameTimerInterval = setInterval(
    () => (el("displayTime").innerHTML = ++elapsedSeconds + " s"),
    1000,
  );
};
//starting a new game, with onlinck function initialization
el("startBtn").onclick = startnewGame;
el("resetBtn").onclick = () =>
  confirm("Game resatrt?") &&
  startnewGame();
el("backBtn").onclick = () => {//goiung back to setting page
  clearInterval(gameTimerInterval);
  window.location.href = "index.html";//loading on the same page
};

el("saveBtn").onclick = () => {
  if (!movesCount && !currentScore && !pairsRemaining)
    return alert("There is no active game to save.");
  const deck = Array.from(el("gameBoard").children).map((c) => ({
    class: c.className,
    html: c.innerHTML,
    val: c.getAttribute("data"),
    id: c.getAttribute("dataId"),
  }));

  //storing the game if the player has already played and moves have already been made(0001)

  localStorage.setItem(
    "gameSession",
    JSON.stringify({
      movesCount,
      matchesFound,
      pairsRemaining,
      currentScore,
      elapsedSeconds,
      deck,
      boardClass: el("gameBoard").className,
    }),
  );
  alert("Your game session has been saved!");
};

el("loadBtn").onclick = () => {
  const state = JSON.parse(localStorage.getItem("gameSession"));
  if (!state) return alert("No gmae saved");
  ({ movesCount, matchesFound, pairsRemaining, currentScore, elapsedSeconds } =
    state);//getting the loaded game, that has already been saved.(0001)
  updateGame();//0002
  el("gameBoard").className = state.boardClass;
  el("gameBoard").innerHTML = "";
  state.deck.forEach((d) => {
    let div = document.createElement("div");
    div.className = d.class;
    div.innerHTML = d.html;
    div.setAttribute("data", d.val);
    div.setAttribute("dataid", d.id);
    div.onclick = function () {
      evaluateCardClick(this);
    };
    el("gameBoard").appendChild(div);
  });
  cardFlipUno = cardFlipTwo = null;
  isBoardLocked = false;
  if (JSON.parse(localStorage.getItem("gameSavedSettings") || "{}").showTimer)
    startTimer();
  alert("Game session where successfully!");
  logNewMsg("Continue from where you left off");
};

function startnewGame() {
  el("gameBoard").innerHTML = el("logArea").innerHTML = "";
  el("messageArea").innerHTML = "Let's match the game";
  movesCount = matchesFound = currentScore = 0;

  const cfg = JSON.parse(localStorage.getItem("gameSavedSettings"));
  if (!cfg) return alert("Go to setting to set the game.");

  pairsRemaining =
    cfg.boardSize == "4x4" ? 8 : cfg.boardSize == "4x5" ? 10 : 18;
  el("gameBoard").className = `game-board board-${cfg.boardSize}`;
  updateGame();//0002
  makingDeck(cfg.pairType, pairsRemaining);

  //shuffle cheched
  if (cfg.shuffleAnimation) el("gameBoard").classList.add("shuffle-active");

  //shuffle checked
  if (cfg.showTimer) {
    elapsedSeconds = 0;
    startTimer();
  } else el("displayTime").innerHTML = "OFF";
}
function makingDeck(type, count) {
  const ccards = {
    //AI was used ---------------------------------------------------------ASK sir if allowed
    "Number and Word": [
      ["1", "one"],
      ["2", "two"],
      ["3", "three"],
      ["4", "four"],
      ["5", "five"],
      ["6", "six"],
      ["7", "seven"],
      ["8", "eight"],
      ["9", "nine"],
      ["10", "ten"],
      ["11", "eleven"],
      ["12", "twelve"],
      ["13", "thirteen"],
      ["14", "fourteen"],
      ["15", "fifteen"],
      ["16", "sixteen"],
      ["17", "seventeen"],
      ["18", "eighteen"],
    ],
    "Sum and Answer": [
      ["2+2", "4"],
      ["3+3", "6"],
      ["4+1", "5"],
      ["5+4", "9"],
      ["10-2", "8"],
      ["6+6", "12"],
      ["7*2", "14"],
      ["3*5", "15"],
      ["10+8", "18"],
      ["1+0", "1"],
      ["2+5", "7"],
      ["9-6", "3"],
      ["8+3", "11"],
      ["10+3", "13"],
      ["4*2", "8"],
      ["9+1", "10"],
      ["3*4", "12"],
      ["5*3", "15"],
    ],
    "Mixed Array": [
      ["1", "one"],
      ["2+2", "4"],
      ["3", "three"],
      ["10-2", "8"],
      ["5", "five"],
      ["5+5", "10"],
      ["7", "seven"],
      ["3+3", "6"],
      ["9", "nine"],
      ["6+6", "12"],
      ["11", "eleven"],
      ["7+7", "14"],
      ["13", "thirteen"],
      ["8+8", "16"],
      ["15", "fifteen"],
      ["9+9", "18"],
      ["17", "seventeen"],
      ["2", "two"],
    ],
  };

  let items = (ccards[type] || ccards["Mixed Array"])
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
  let deck = [];
  items.forEach((x, i) =>
    deck.push({ val: x[0], id: i }, { val: x[1], id: i }),
  );
  deck
    .sort(() => Math.random() - 0.5)
    .forEach((c) => {
      let div = document.createElement("div");
      div.className = "number-card";
      div.innerHTML = "?";
      div.setAttribute("data", c.val);
      div.setAttribute("dataId", c.id);
      div.onclick = function () {
        evaluateCardClick(this);
      };
      el("gameBoard").appendChild(div);
    });
}

function evaluateCardClick(c) {
  if (
    isBoardLocked ||
    c.classList.contains("flipped") ||
    c.classList.contains("matched")
  )
    return;
  c.innerHTML = c.getAttribute("data");
  c.classList.add("flipped");
  if (!cardFlipUno) cardFlipUno = c;
  else {
    cardFlipTwo = c;
    isBoardLocked = true;
    movesCount++;
    updateGame();//0002
    processOutcomeLogic();
  }
}

function processOutcomeLogic() {
  const v1 = cardFlipUno.getAttribute("data"),
    v2 = cardFlipTwo.getAttribute("data");
  if (
    cardFlipUno.getAttribute("dataId") === cardFlipTwo.getAttribute("dataId")
  ) {
    matchesFound++;
    pairsRemaining--;

    const diff = (
      JSON.parse(localStorage.getItem("gameSavedSettings") || "{}")
        .difficulty || ""
    ).toLowerCase();
    currentScore += diff === "easy" ? 10 : diff === "medium" ? 20 : 30;
    updateGame();//0002

    el("messageArea").innerHTML = `Matched:${v1}___${v2}`;

    logNewMsg(`Matched: ${v1}___${v2}.`);

    cardFlipUno.classList.add("matched");
        
    cardFlipTwo.classList.add("matched");

    cardFlipUno = cardFlipTwo = null;
    isBoardLocked = false;

    if (pairsRemaining === 0) {
      el("messageArea").innerHTML =
        `Mathches are made! You scored: ${currentScore}`;
      clearInterval(gameTimerInterval);
      alert(`Mathches are made! You scored: ${currentScore}`);
      let best = parseInt(retrieveGameCookie("bestScore") || "0");

      if (currentScore > best) {
        saveGameCookie("bestScore", currentScore);
        el("displayBestScore").innerHTML = currentScore;
      }
    }
  } else {//the messages that pops up in game log when a pair that  does not match
    el("messageArea").innerHTML = "Picked cards are not a matching pair";
    logNewMsg("Picked cards are not a matching pair");
    setTimeout(() => {
      cardFlipUno.innerHTML = cardFlipTwo.innerHTML = "?";
      cardFlipUno.classList.remove("flipped");
      cardFlipTwo.classList.remove("flipped");
      cardFlipUno = cardFlipTwo = null;
      isBoardLocked = false;
    }, 1000);
  }
}

//the message that pops up in game log when a pair matches 
function logNewMsg(msg) {
  let ndata = new Date(),
    t = [ndata.getHours(), ndata.getMinutes(), ndata.getSeconds()]
      .map((v) => (v < 10 ? "0" + v : v))
      .join(":");
  let p = document.createElement("p");//created a new elemnet for the  logging the game messages.
  p.className = "log-entry";
  p.innerHTML = `[${t}] ${msg}`;
  el("logArea").prepend(p);
}

function updateGame() {//0002
  el("displayMoves").innerHTML = movesCount;
  el("displayMatches").innerHTML = matchesFound;
  el("displayPairsLeft").innerHTML = pairsRemaining;
  el("displayScore").innerHTML = currentScore;
}

//to be added according to rubric
/*
JavaScript requirements 
You must demonstrate: 
- Event handling (click, change, input, submit)  
- Functions with parameters  
- JavaScript objects (player, game state, etc.)  
- Use arrays to manage game elements, for example 
- game elements (e.g. objects, cards, positions)  
- score history or game events  
- dynamic game state 
- Use of built-in functions: 
- Math (e.g. randomness, scoring)  
- String (e.g. formatting, validation) 
- Text input (e.g. player name)
*/
