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

/* change x
 Set example match based on pairType
 */
function setExampleMatch(pairType) {
  const ex1 = el("exampleCard1");
  const ex2 = el("exampleCard2");
  if (!ex1 || !ex2) return;

  if (pairType === "Sum and Answer") {
    ex1.innerHTML = "2+2";
    ex2.innerHTML = "4";
  }

  else if (pairType === "Mixed") {
    ex1.innerHTML = "5+5";
    ex2.innerHTML = "10";
  }
  else {
    // Default to Number and Word
    ex1.innerHTML = "1";
    ex2.innerHTML = "one";
  }
}
/* end of change x */

//====================loading the html===============
//html musy have saved settings from the luancher
window.onload = () => {
  //from gmae 3, yt version
  const cfg = JSON.parse(localStorage.getItem("gameSavedSettings") || "{}");

  //change x
  //add backgrounds for Sum and Answer & Mixed Array

  document.body.classList.remove("bg-sum-and-answer", "bg-mixed-array");
  if (cfg.pairType === "Sum and Answer") {
    document.body.classList.add("bg-sum-and-answer");
  } else if (cfg.pairType === "Mixed") {
    document.body.classList.add("bg-mixed-array");
  }
  //end of change x

  if (cfg.playerName) {
    el("displayPlayer").innerHTML = cfg.playerName;
    el("displayBoardSize").innerHTML = cfg.boardSize;
    el("displayDifficulty").innerHTML =
      cfg.difficulty.charAt(0).toUpperCase() + cfg.difficulty.slice(1);
    el("displayPairType").innerHTML = cfg.pairType;
  }

  //change x: update example match on page load
  setExampleMatch(cfg.pairType);
  //end of change x

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

//=========================================================================================================================
// change x: 
// added a hints button featurre for the playr to flip the cards for 2 seconds 



var hintsUsedSoFar = 0;

//function for showing the hint
function showHintToPlayer() {
  //get the saved settings from the launcher to check if they clicked enableHints
  var cfg = JSON.parse(localStorage.getItem("gameSavedSettings") || "{}");

  if (isBoardLocked == true) {
    return;
  }

  if (cfg.enableHints == true) { // check if hints are turned on
    if (hintsUsedSoFar < 2) { // check if they have hints left
      hintsUsedSoFar = hintsUsedSoFar + 1; // count hint
      var allCardsOnBoard = document.getElementsByClassName("number-card"); // get all cards

      var oldLock = isBoardLocked; //save the lock state
      isBoardLocked = true; // lock the board so they cant click

      // go through everyard
      for (var i = 0; i < allCardsOnBoard.length; i++) {
        var theCard = allCardsOnBoard[i];
        // if the card is not already matched or flipped, flip it and add the hint tag so we know its a hint card
        if (theCard.classList.contains("matched") == false && theCard.classList.contains("flipped") == false) {
          theCard.innerHTML = theCard.getAttribute("data");
          theCard.classList.add("flipped");
          theCard.classList.add("hint-card");
        }
      }

      // wait for 2 seconds (2000 ms) and then flip them back
      setTimeout(function () {
        for (var j = 0; j < allCardsOnBoard.length; j++) {
          var aCard = allCardsOnBoard[j];
          if (aCard.classList.contains("hint-card") == true) {
            aCard.innerHTML = "?";
            aCard.classList.remove("flipped");
            aCard.classList.remove("hint-card"); // remove the tag so we know its not a hint card anymore
          }
        }
        isBoardLocked = oldLock;
      }, 2000); // 2 seconds max

    }

    else {
      alert("You already used up your hints this round!"); // mgs if out of hints
    }
  }

  else {
    alert("Hints are disabled in settings! Go to launcher to enable them."); //msg if disabled
  }
}

el("hintBtn").onclick = showHintToPlayer; //attach the function to the button
// end of change x
//============================================

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

  // ===================================================================
  // Change X
  // I learned that sessionStorage is better for temporary saves because it clears when the tab closes.

  var mySaveData = JSON.stringify({
    movesCount: movesCount,
    matchesFound: matchesFound,
    pairsRemaining: pairsRemaining,
    currentScore: currentScore,
    elapsedSeconds: elapsedSeconds,
    deck: deck,
    boardClass: el("gameBoard").className,
  });
  sessionStorage.setItem("myGameSession", mySaveData);
  alert("Your game session has been saved!");
};

el("loadBtn").onclick = () => {
  // ================================================
  // Change X
  // I learned that sessionStorage is better for temporary saves because it clears when the tab closes.

  var savedString = sessionStorage.getItem("myGameSession");
  const state = JSON.parse(savedString);
  if (!state) return alert("Oops! No game saved in this session!");
  ({ movesCount, matchesFound, pairsRemaining, currentScore, elapsedSeconds } =
    state);//getting the loaded game, that has already been saved.
  updateGame();
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
  hintsUsedSoFar = 0; // change x: reset hints back to 0 for the new round


  const cfg = JSON.parse(localStorage.getItem("gameSavedSettings"));
  if (!cfg) return alert("Go to setting to set the game.");

  /* change x
   Update background when a new game starts for Sum and Answer & Mixed Array
   */
  document.body.classList.remove("bg-sum-and-answer", "bg-mixed-array");
  if (cfg.pairType === "Sum and Answer") {
    document.body.classList.add("bg-sum-and-answer");
  } else if (cfg.pairType === "Mixed") {
    document.body.classList.add("bg-mixed-array");
  }
  /* end of change x */

  pairsRemaining =
    cfg.boardSize == "4x4" ? 8 : cfg.boardSize == "4x5" ? 10 : 18;
  el("gameBoard").className = `game-board board-${cfg.boardSize}`;
  updateGame();//0002
  makingDeck(cfg.pairType, pairsRemaining);

  /* change x: update example match on new game */
  setExampleMatch(cfg.pairType);
  /* end of change x */

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

    //CHange x
    //Added red style for wrong pair, to make it more clear for the player
    cardFlipUno.style.background = "#fee2e2";
    cardFlipUno.style.color = "#991b1b";
    cardFlipUno.style.borderColor = "#ef4444";

    cardFlipTwo.style.background = "#fee2e2";
    cardFlipTwo.style.color = "#991b1b";
    cardFlipTwo.style.borderColor = "#ef4444";
    //end of change x

    //======================================================================================
    // change x:
    // For the difficulty level, removed the appearance of the card when tapped by 0.2 seconds 

    var savedGameSettingsStr = localStorage.getItem("gameSavedSettings") || "{}";
    var currentDiff = JSON.parse(savedGameSettingsStr).difficulty || "medium";
    var waitTime = 1000; // default for easy

    if (currentDiff.toLowerCase() == "medium") {
      waitTime = 800; // subtract 0.2 seconds
    } else if (currentDiff.toLowerCase() == "hard") {
      waitTime = 600; // subtract another 0.2 seconds
    }

    setTimeout(() => {
      // Chnage x
      //Reset red style after showing the wrong pair, to make it ready for the next try
      cardFlipUno.style.background = "";
      cardFlipUno.style.color = "";
      cardFlipUno.style.borderColor = "";

      cardFlipTwo.style.background = "";
      cardFlipTwo.style.color = "";
      cardFlipTwo.style.borderColor = "";
      //end of change x

      cardFlipUno.innerHTML = cardFlipTwo.innerHTML = "?";
      cardFlipUno.classList.remove("flipped");
      cardFlipTwo.classList.remove("flipped");
      cardFlipUno = cardFlipTwo = null;
      isBoardLocked = false;
    }, waitTime);

    // end of change x
    //==========================================================================================
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

// =========================================================================
// Change X
//contructor adding, rubric req

//Player Obj Constructor
//linking the player's name to the best scoree
function Player(name, bestScore) {
  this.name = name || "Anonymous";
  this.bestScore = bestScore || 0;

  this.updateScore = function (newScore) {
    if (newScore > this.bestScore) {
      this.bestScore = newScore;
    }
  };
}

//GameState Obj Constructor
//current dyamic state of an active session
function GameState(pairsRemaining) {
  this.movesCount = 0;
  this.matchesFound = 0;
  this.pairsRemaining = pairsRemaining || 0;
  this.currentScore = 0;
  this.elapsedSeconds = 0;
  this.isBoardLocked = false;
}

// Card Obj Constructor
//storing cards with the id, value, and status
function Card(id, val, htmlContent) {
  this.id = id;
  this.val = val;
  this.htmlContent = htmlContent || "?";
  this.isFlipped = false;
  this.isMatched = false;

  this.flip = function () {
    this.isFlipped = true;
  };
  this.match = function () {
    this.isMatched = true;
  };
}

//GameLog Obj Constructor
//history of score events and game messages
function GameLog() {
  this.entries = [];

  this.addEntry = function (message) {
    let date = new Date();
    let timeString = [date.getHours(), date.getMinutes(), date.getSeconds()]
      .map((v) => (v < 10 ? "0" + v : v))
      .join(":");
    let fullMessage = `[${timeString}] ${message}`;
    this.entries.push(fullMessage);
    return fullMessage;
  };
}
// =========================================================================

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
