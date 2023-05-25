let numClicks = 0;
let difficulty = parseInt($("#difficultySelect").val()); // Initialize difficulty based on default selected value
let numPairs = difficulty;

let numMatchedPairs = 0;
let gameTime = 300; // game time in seconds

let incorrectPairs = 0; // count of incorrect pairs
let timerInterval = null; // variable to hold the timer interval

let flipBackTimeoutId = null;

let firstCard = undefined;
let secondCard = undefined;
let isFlipping = false;



// Display initial game stats
$("#totalPairs").text(`Total Number of Pairs: ${numPairs}`);
$("#pairsLeft").text(`Number of Pairs Left: ${numPairs}`);
$("#numClicks").text(`Number of Clicks: ${numClicks}`);
$("#matchPairs").text(`Number of Matches: ${numMatchedPairs}`);
$("#timer").text(`You got ${gameTime} seconds. 0 seconds passed!`);

function adjustCardSize() {
  const cardSize = 100;  // adjust this value to the desired card size

  // adjust the size of the cards
  $('.card').css('width', `${cardSize}px`);
  $('.card').css('height', `${cardSize}px`);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

function revealCardsTemporarily() {
  alert('Power Up Activated! All cards will be revealed for 1 second.');

  if (flipBackTimeoutId) {
    clearTimeout(flipBackTimeoutId);
    flipBackTimeoutId = null;
  }

  let cardsToFlipBack = $(".card:not(.matched)"); // Keep track of the cards to flip back
  cardsToFlipBack.removeClass("flip");

  setTimeout(() => {
    cardsToFlipBack.each(function () {
      if (!$(this).hasClass("matched")) {
        $(this).addClass("flip");
      }
    });

    // Reset firstCard and secondCard and isFlipping
    firstCard = secondCard = undefined;
    isFlipping = false;
  }, 1000);
}


const setup = async () => {
  adjustCardSize(); // call adjustCardSize function here

  // Update game stats here after adjusting card size
  $("#totalPairs").text(`Total Number of Pairs: ${numPairs}`);
  $("#pairsLeft").text(`Number of Pairs Left: ${numPairs}`);

  const pokemons = await fetchRandomPokemons(numPairs);
  let cards = []; // Create an array to hold all cards

  // Double each pokemon and put it into cards array
  for (let pokemon of pokemons) {
    cards.push(pokemon);
    cards.push(pokemon);
  }

  shuffleArray(cards);
  console.log(pokemons);


  // Apply Pokemon images to card fronts according to the shuffled array
  for (let i = 0; i < cards.length; i++) {
    const pokemon = cards[i];
    $('#game_grid').append(`
      <div class="card flip">
        <img id="img${i + 1}" class="front_face" src="${pokemon.sprites.front_default}" alt="">
        <img class="back_face" src="back.webp" alt="">
      </div>
    `);
  }

  adjustCardSize(); // Call adjustCardSize function here again


  $(".card").on("click", function () {
    if (isFlipping) return;

    const currentCard = $(this).find(".front_face")[0];

    if (currentCard === firstCard) return;

    numClicks++;
    $("#numClicks").text(`Number of Clicks: ${numClicks}`);

    // Always remove the flip class when a card is clicked
    $(this).removeClass("flip");

    if (!firstCard) {
      firstCard = currentCard;
    } else {
      secondCard = currentCard;
      console.log(firstCard, secondCard);

      isFlipping = true;

      if (firstCard.src === secondCard.src) {
        console.log("match");
        $(`#${firstCard.id}`).parent().off("click").addClass("matched");
        $(`#${secondCard.id}`).parent().off("click").addClass("matched");

        numMatchedPairs++;
        $("#matchPairs").text(`Number of Matches: ${numMatchedPairs}`);
        $("#pairsLeft").text(`Number of Pairs Left: ${numPairs - numMatchedPairs}`);

        firstCard = secondCard = undefined;
        isFlipping = false;

        // check if user won the game
        if (numMatchedPairs === numPairs) {
          setTimeout(() => {
            alert("Congratulations! You won the game.");
            resetGame();
          }, 500);
        }
      } else {
        console.log("no match");
        flipBackTimeoutId = setTimeout(() => {
          // Add the flip class back only when there is no match
          $(`#${firstCard.id}`).parent().addClass("flip");
          $(`#${secondCard.id}`).parent().addClass("flip");

          firstCard = secondCard = undefined;
          isFlipping = false;
        }, 1000);

        incorrectPairs++;

        if (incorrectPairs % 10 === 0) {
          revealCardsTemporarily();
        }
      }
    }
  });

  // Timer setup
  let timePassed = 0;
  timerInterval = setInterval(() => {
    timePassed++;
    $("#timer").text(`You got ${gameTime} seconds. ${timePassed} seconds passed!`);
    if (timePassed >= gameTime) {
      alert("Time's up! Game Over.");
      clearInterval(timerInterval);
      resetGame();
    }
  }, 1000);
}


// Fetches a specified number of unique random Pokemon
const fetchRandomPokemons = async (numPairs) => {
  let pokemonArr = [];

  while (pokemonArr.length < numPairs) {
    try {
      const pokemonNum = Math.floor(Math.random() * 800) + 1;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonNum}`);
      const data = await response.json();

      if (!pokemonArr.some(p => p.id === data.id)) {
        pokemonArr.push(data);
      }
    } catch (error) {
      console.error(`Error fetching Pokemon: ${error}`);
    }
  }

  return pokemonArr;
}

$("#startBtn").on("click", function () {
  // Hide the difficulty select dropdown, start button, and difficulty label
  $("#difficultySelect").css("visibility", "hidden");
  $("#startBtn").css("visibility", "hidden");
  $("#difficultyLabel").css("visibility", "hidden");

  $("#game_grid").css("display", "grid"); // Show the game grid
  setup();
});

// Resets the game state
const resetGame = () => {
  numClicks = 0;
  numMatchedPairs = 0;
  incorrectPairs = 0;
  clearInterval(timerInterval); // Stops the timer
  timerInterval = null;
  $("#game_grid").empty();
  numPairs = difficulty;
  $("#timer").text(`You got ${gameTime} seconds. 0 seconds passed!`); // Resets the timer text

  // Show the difficulty select dropdown, start button, and difficulty label
  $("#difficultySelect").css("visibility", "visible");
  $("#startBtn").css("visibility", "visible");
  $("#difficultyLabel").css("visibility", "visible");

  $("#game_grid").css("display", "none");

  // Reset the game stats
  $("#totalPairs").text(`Total Number of Pairs: ${numPairs}`);
  $("#pairsLeft").text(`Number of Pairs Left: ${numPairs}`);
  $("#numClicks").text(`Number of Clicks: ${numClicks}`);
  $("#matchPairs").text(`Number of Matches: ${numMatchedPairs}`);
};

$("#resetBtn").on("click", resetGame); // Call resetGame function when reset button is clicked






$("#difficultySelect").on("change", function () {
  difficulty = parseInt($(this).val());
  numPairs = difficulty;

  // Set up the grid layout based on difficulty level
  if (difficulty === 6) { // if easy mode
    $('#game_grid').css('grid-template-columns', 'repeat(3, 1fr)');
    $('#game_grid').css('grid-template-rows', 'repeat(2, 1fr)');
  } else if (difficulty === 12) { // if normal mode
    $('#game_grid').css('grid-template-columns', 'repeat(6, 1fr)');
    $('#game_grid').css('grid-template-rows', 'repeat(2, 1fr)');
  } else if (difficulty === 18) { // if hard mode
    $('#game_grid').css('grid-template-columns', 'repeat(6, 1fr)');
    $('#game_grid').css('grid-template-rows', 'repeat(3, 1fr)');
  }

  resetGame();
});

$(document).ready(function () {
  $("#theme1").click(function () {
    $("body").css("background-image", "url('images/wp001.jpg')");
  });
  $("#theme2").click(function () {
    $("body").css("background-image", "url('images/wp002.jpg')");
  });
  $("#theme3").click(function () {
    $("body").css("background-image", "url('images/wp003.jpg')");
  });
});


// Start the game when the page loads
$(document).ready(() => {
});
