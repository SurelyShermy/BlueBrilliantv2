const logOut = document.getElementById("logOutButton");
const logOut2 = document.getElementById("logOutButton2");

const joinGame = document.getElementById("joinGameButton");
const joinGame2 = document.getElementById("joinGameButton2");

const tutorial = document.getElementById("tutorialButton");
const tutorial2 = document.getElementById("tutorialButton2");

const rules = document.getElementById("rulesButton");
const rules2 = document.getElementById("rulesButton2");

var userNameDisplay = document.getElementById("userNameDisplay");
var urlParams = new URLSearchParams(window.location.search); //this should retrieve the username that was encoded in the url
var username = urlParams.get("username");
userNameDisplay.textContent = "You are logged in as: "+username; //this sets the text in the top right to display properly

document.body.style.overflow = "hidden";

getUserData(username);


function getUserData(username) {
    // Create a FormData object to send the username
    const formData = new FormData();
    formData.append("username", username);

    // Make a fetch request to your PHP script to retrieve user data
    fetch("getStats.php", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network Response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Assuming the response from getStats.php is a JSON object

        //The following 3 commented out are perfectly valid
        //const draws = data.draws;
        //const user_id = data.user_id;
        //const id = data.id;
        const games_played = data.games_played;
        const losses = data.losses;
        const wins = data.wins;
        const rate = (wins / losses).toFixed(3);
        var totalPlayed = document.getElementById("totalPlayed");
        var totalWins = document.getElementById("totalWins");
        var winRate = document.getElementById("winRate");
        //
        totalPlayed.textContent = "Total Games Played: "+games_played;
        totalWins.textContent = "Games Won: "+wins;
        winRate.textContent = "Win Rate: "+rate;

    })
    .catch(error => {
        console.log("this raxxx");
        console.error("Error:", error);
        alert("Error connecting to the server");
    });
}



document.getElementById("logout-btn").addEventListener("click", function() {
    fetch('logout.php', {
        method: 'POST',
    })
    .then(response => response.text())
    .then(data => {
        if (data === "success") {
            alert('Logged out successfully');
            window.location.href = '../login'; // Redirect to login page or wherever you want
        } else {
            window.location.href = '../login'; // Redirect to login page or wherever you want
        }
    })
    .catch(error => console.error('Error:', error));
});
