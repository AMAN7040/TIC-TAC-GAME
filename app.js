// ASSGINING NAME TO PLAYERS
const player1NameDiv = createAndAssignDiv("p1Name", "playerName");
const player2NameDiv = createAndAssignDiv("p2Name", "playerName");
let p1Initial, p2Initial; // Initialize players
//getting the reference of the elements and assiging it to the variables
const [player1Input, player1Initial, player2Input, player2Initial, submitBtn, player1, player2] = 
                               ["player1Input", "player1Initial", "player2Input", "player2Initial", "submitBtn", "player1", "player2"].map(id =>
                                 document.getElementById(id));
const board = document.getElementById('board');
const boxes = document.querySelectorAll(".box");
const turn = document.querySelector("#turn"); //get the turn element
const restartButton = document.querySelector("#restart");
const resetScoreButton = document.querySelector("#resetScoreButton");
const playAgain = document.querySelector("#playAgain");
const modeOptions = document.querySelector('#modeOptions');
const gameContainer = document.querySelector('#gameContainer');

let boxState = ['','','','','','','','',''];
let player1Score = 0;
let player2Score = 0;
let draw = 0;
let playerTurn = p1Initial;
let gameActive = true;
let friendMode = true;

const winBoxes = [[0,1,2],[3,4,5],[6,7,8],
                  [0,3,6],[1,4,7],[2,5,8],
                  [0,4,8],[6,4,2]]; //these are all the array of boxes in which if the users click it will lead to win


[player1NameDiv, player2NameDiv].forEach(div => { div.style.display = "none"; });     //initaially sets the display property to none

//function to create the Name div's
function createAndAssignDiv(id, className) {
    const div = document.createElement("div");
    div.id = id;
    div.className = className;
    return div;
}

function initializePlayers() {
    p1Initial = player1Initial.value;
    p2Initial = player2Initial.value;
}

function checkinputsFilled() {
    const inputs = [player1Input, player1Initial, player2Input, player2Initial];
    return inputs.every(input => input.value.trim() !== "");
}
// Function to initialize the game
function initializeGame(mode) {
    // Assuming playerTurn and turn are defined elsewhere
    initializePlayers();
    playerTurn = p1Initial;
    turn.innerText = `${mode === 'bot' ? 'Bot Mode' : 'Friend Mode'} ${playerTurn}'s turn`;
    
    // Show player name divs
    [player1NameDiv, player2NameDiv].forEach(div => div.style.display = "inline");
    
    // Hide input fields
    [player1Input, player1Initial, player2Input, player2Initial].forEach(input => {
        input.style.display = "none";
        input.disabled = true;
    });
    
    // Set player names
    player1NameDiv.textContent = player1Input.value.trim();
    player2NameDiv.textContent = mode === 'bot' ? 'Bot' : player2Input.value.trim();
    
    // Append player name divs
    player1.insertBefore(player1NameDiv, player1Input.nextSibling);
    player2.insertBefore(player2NameDiv, player2Input.nextSibling);
}

//EVENT LISTENERS
submitBtn.addEventListener("click", handleSubmit);                   //submits the player details when clicke on button
board.addEventListener('click',handlingBox);                         //triggeres the function when we click on the box
restartButton.addEventListener("click", handleRestart);              //triggeres the function when clicked on the restart button
resetScoreButton.addEventListener('click', handleReset);             //triggers when the rest button clicked
playAgain.addEventListener('click', handleNewGame);                    //triggers when Play again is clicked
modeOptions.addEventListener('click', switchMode);                   //Switches the mode between Friend mode and Bot mode


//submits the details
function handleSubmit(){
    if (checkinputsFilled()) {
        initializeGame(friendMode ? 'friend' : 'bot');
    } else {
        alert("Please fill out all player information before submitting.");
    }
}

//function to check if initial entered cannot be changed i.e does not let the box to be clicked twice
function handlingBox(e){
      // Check if player names and initials are set
      if (!p1Initial || !p2Initial || !player1Input.value.trim() || !player2Input.value.trim()) {
        // If names or initials are not set, return without updating the box content
        return;
    }
    const clickedBox = e.target;
    const clickedBoxIndex = parseInt(clickedBox.getAttribute("data-boxIndex"));
    if (!clickedBox.classList.contains("box") || !gameActive) {
        return; // Ignore clicks on elements other than boxes or if the game is not active
    }
    if(boxState[clickedBoxIndex]==='' && gameActive){
            trackState(clickedBox, clickedBoxIndex);
            checkResult();
        }
    }
    
 //to set the clicked box and update the boxState
 function trackState(clickedBox,clickedBoxIndex){
    boxState[clickedBoxIndex] = playerTurn;
    clickedBox.innerText = playerTurn;
}

//function to check who won the game or wheather it is a draw
function checkResult(){
    let result = false;
    let winningBoxes = [];
    for(let i =0; i<=7; i++){
        let boxCondition = winBoxes[i];
        let firstIndex = boxState[boxCondition[0]];
        let secondIndex = boxState[boxCondition[1]];
        let thirdIndex = boxState[boxCondition[2]];
        if(firstIndex==="" || secondIndex==="" || thirdIndex===""){
            continue;
        }
        if(firstIndex === secondIndex && secondIndex===thirdIndex){
            result = true;
            winningBoxes = boxCondition;
            break;
        }
    }
    if(result){
        turn.innerText = `${player1NameDiv.textContent} Won`
        winningBoxes.forEach(index=>{
            boxes[index].classList.add('winBox');
        });
        gameActive = false;
        if(playerTurn === p1Initial){
            player1Score++;
        }
        else{
            player2Score++;
        }
        updateScore();
        return true;
    }
    let resultDraw = !boxState.includes("");
    if(resultDraw){
        turn.innerText = "Game is Draw";
        boxes.forEach(box=>{
            box.classList.add('drawBox');
        });
        gameActive = false;
        draw++;
        updateScore();
        return false;
    }
    whoseTurn();
    return false;
}

// updates the score of the players 
function updateScore(){
    document.getElementById('player1Score').innerText = `${player1Score}`;
    document.getElementById('player2Score').innerText = `${player2Score}`;
    document.getElementById('drawScore').innerText = `Draw:${draw}`;
}

//checks which player's turn is this 
function whoseTurn() {
    playerTurn = playerTurn === p1Initial ? p2Initial : p1Initial;
    const modeText = friendMode ? "Friend Mode" : "Bot Mode";
    turn.innerText = `${modeText} | ${playerTurn}'s turn`;

    if(!friendMode && playerTurn===p2Initial &&gameActive){
        setTimeout(()=>{
            makebotMove();
        },500);
    }
}

//first checks which cells are empty and the assign the bot initail in one of the empty boxes after player 1 has played his turn
function makebotMove(){
    const emptyBox = boxState.reduce((acc,box,index)=>{
        if(box===''){
            acc.push(index);
        }
        return acc;
    },[])

    if(emptyBox.length > 0){
        const randomEmptyIndex = Math.floor(Math.random() * emptyBox.length);
        const botMove = emptyBox[randomEmptyIndex];
        const botBox = boxes[botMove];
        trackState(botBox, botMove);
        checkResult();

    }
}

//function to restart the game
 function handleRestart(){
    modeOptions.textContent = 'Friend Mode';
    handleNewGame();
    [player1Input, player1Initial, player2Input, player2Initial].forEach(input => {
        input.style.display = "inline";
        input.value = '';
        input.disabled = false;
    })
    player1NameDiv.textContent = '';
    player2NameDiv.textContent = '';
    [player1NameDiv, player2NameDiv].forEach(div => div.style.display = "none");
    
    defScoreCard();
 }

 //function to reset the scores
function handleReset(){
    if(checkinputsFilled()){
        player1Score = 0;
        player2Score = 0;
        draw = 0;
        updateScore();
    }
}

//function to start a new Game
function handleNewGame(){
    gameActive = true;
    boxState = ['','','','','','','','',''];
    playerTurn = p1Initial;
    turn.innerText = "Players turn";
    boxes.forEach(box=>{
       box.classList.remove('winBox', 'drawBox');
    });
    boxes.forEach((box)=>{
        box.innerText = "";
    });
}

//function to switch mode
function switchMode(){
    friendMode = !friendMode;
    const modeText = friendMode ? "Friend Mode" : "Bot Mode";
    turn.innerText = `${modeText} | Player's turn`;
    modeOptions.innerText = modeText;
    [player1NameDiv, player2NameDiv].forEach(div => div.style.display = "none");
    defScoreCard();
    handleNewGame();

    if(!friendMode){
        [player2Input, player2Initial].forEach(element => element.style.display = 'none');
        [player1Input, player1Initial].forEach(input => {
            input.style.display = "inline";
            input.value = '';
            input.disabled = false;
        })
        player2Input.value = 'Bot';
        p2Initial = '0';
        player2Initial.value = p2Initial;
        if (playerTurn === p2Initial && gameActive) {
            makebotMove();
        }
    }
    else{
        [player1Input, player1Initial, player2Input, player2Initial].forEach(input => {
            input.style.display = "inline";
            input.value = '';
            input.disabled = false;
        })
    }
}

//default scoreCard
function defScoreCard(){
    document.getElementById('player1Score').innerText = 'score';
    document.getElementById('player2Score').innerText = 'score';
    document.getElementById('drawScore').innerText = 'Draw:';
}

