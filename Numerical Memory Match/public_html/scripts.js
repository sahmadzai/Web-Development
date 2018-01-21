/**
 * Siraj Ahmadzai
 Student ID: 101040544
 Course: COMP 2406
 Assignment 3
 Date: 2016/11/13
 */
$(document).ready(logIn);
var username = "";
var guessCounter = 0;
/**
 * Prompts for a username and it registers the user for a game of concentration
 */
function logIn() {
    do
    {
        username = prompt("Enter UserName: ");
        if (username === "") {
            alert("Try Again!");
        }
    } while (username === "");

    $.ajax({
        method: "GET",
        url: "/memory/intro",
        data: {'username': username},
        success: displayGame,
        dataType: 'json'
    });
}

/**
 * Display Game
 * @param size x size of the game
 */
function displayGame(size) {

    var $wonDiv = jQuery("#Won");
    $wonDiv.removeClass("Won");
    $wonDiv.html("");
    guessCounter = 0;
    var $table = jQuery("#gameboard");
    $table.empty();


    for (var rowCounter = 0; rowCounter < size; rowCounter++) {
        var $row = $("<tr></tr>");
        $row.appendTo($table);

        for (var columnCounter = 0; columnCounter < size; columnCounter++) {
            var $card = jQuery('<div></div>',
                {
                    "id": 'card' + rowCounter,
                    "class": 'card',
                    "click": cardClick,
                    "data-row": rowCounter,
                    "data-column": columnCounter
                });
            var $span = $("<span class='cardText'></span>");
            $span.appendTo($card);
            var $cell = $("<td></td>");
            $cell.appendTo($row);
            $card.appendTo($cell);
        }
    }

}
/**
 * OnClick event for the card Divs
 * Decides whether to flip the card
 */
function cardClick() {
    $card = $(this);
    var numOfActiveCards = countActiveCards();
    //if this card is faced down
    if (!isFlipped($(this))) {
        if (numOfActiveCards === 0 || numOfActiveCards === 1) {

            $.ajax({
                method: "GET",
                url: "/memory/card",
                data: {
                    'username': username,
                    "row": $(this).attr("data-row"),
                    "column": $(this).attr("data-column")
                },
                success: function (cardValue) {
                    flipCard(cardValue, $card);
                },
                dataType: 'json'
            });
        }
    }

}
/**
 * Flips the card and decides whether the selected cards match, if they match keep them unflipped if not flipback
 * also decides whether the game is won
 * @param cardValue
 * @param $div
 */
function flipCard(cardValue, $div) {
    // adding cardValue to the span
    console.log(cardValue);
    console.log($div);
    $span = $($div.children()[0]);
    $span.html(cardValue);
    $div.toggleClass("flippedCard active");


    var activeCards = getActiveCards();

    if (activeCards.length === 2) {
        guessCounter++;
        if (getValueOfCard($(activeCards[0])) === getValueOfCard($(activeCards[1]))) {
            $(activeCards[0]).toggleClass("active");
            $(activeCards[1]).toggleClass("active");

            console.log("flippedCount = " + countFlippedCards());
            console.log("allCardsCount = " + jQuery(".card").length);
            if (countFlippedCards() === jQuery(".card").length) {

                var $wonDiv = jQuery("#Won");
                $wonDiv.toggleClass("Won");
                $wonDiv.html("You Won! Guesses made: " + guessCounter + ". New game loading in 5 seconds.");
                setTimeout(function(){
                    $.ajax({
                        method: "GET",
                        url: "/memory/intro",
                        data: {'username': username},
                        success: displayGame,
                        dataType: 'json'
                    });
                }, 5000)


            }

        }
        else {
            setTimeout(function () {
                $(activeCards[0]).toggleClass("flippedCard active");
                $(activeCards[1]).toggleClass("flippedCard active");
                setValueOfCard($(activeCards[0]), "");
                setValueOfCard($(activeCards[1]), "");
            }, 2000);

        }
    }


}
/**
 *Counts the number of active cards
 * @returns {number}
 */
function countActiveCards() {
    // var $cards = document.querySelectorAll(".card");
    var $cards = jQuery(".card");
    var activeCardCounter = 0;
    for (var cardCounter = 0; cardCounter < $cards.length; cardCounter++) {
        var classList = $($cards[cardCounter]).attr('class').split(/\s+/);
        for (var classCounter = 0; classCounter < classList.length; classCounter++) {
            if (classList[classCounter] === 'active') {
                activeCardCounter++;
                break;
            }
        }
    }
    return activeCardCounter;
}
/**
 * Counts the number of flipped cards
 * @returns {number}
 */
function countFlippedCards() {
    // var $cards = document.querySelectorAll(".card");
    var $cards = jQuery(".card");
    var activeCardCounter = 0;
    for (var cardCounter = 0; cardCounter < $cards.length; cardCounter++) {
        var classList = $($cards[cardCounter]).attr('class').split(/\s+/);
        for (var classCounter = 0; classCounter < classList.length; classCounter++) {
            if (classList[classCounter] === 'flippedCard') {
                activeCardCounter++;
                break;
            }
        }
    }
    return activeCardCounter;

}
/**
 * gets value of card
 * @param $card
 * @returns {*}
 */
function getValueOfCard($card) {

    var $span = $($card.children()[0]);
    return $span.html();
}
/**
 * sets the value of card
 * @param $card
 * @param cardValue
 */
function setValueOfCard($card, cardValue) {
    $span = $($card.children()[0]);
    $span.html(cardValue);
}

/**
 *
 * @returns {Array} Returns array of active cards
 */
function getActiveCards() {
    var $cards = jQuery(".card");
    var activeCards = [];
    for (var cardCounter = 0; cardCounter < $cards.length; cardCounter++) {
        var classList = $($cards[cardCounter]).attr('class').split(/\s+/);
        for (var classCounter = 0; classCounter < classList.length; classCounter++) {
            if (classList[classCounter] === 'active') {
                activeCards.push($cards[cardCounter]);
                break;
            }
        }
    }
    return activeCards;
}
/**
 * check if the card is flipped
 * @param $div
 * @returns {boolean}
 */
function isFlipped($div) {
    var $span = $($div.children()[0]);
    if ($span.html() === "") {
        return false;
    }
    else {
        return true;
    }
}
