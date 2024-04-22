Welcome to BlueBrilliant v2, this full stack webapp was designed by Alex Sherman and Liam Richards. 

To clone the rust repo, access it here:
https://github.com/SurelyShermy/BlueBrilliant

# Startup Instructions
This webapp uses 2 servers, a django backend for most REST requests, and a Rust Backend to handle chess moves and logic. The websocket is established through the rust backend so please refer to that for grading. This repo has a nested repo which holds BlueBrilliant, the rust backend. From what I can tell, you will need to clone this yourself into the main project directory so that it looks like this:


cse312-for-profit-only
--Bluebrilliantv2/          Django webapp
--engine/                   Rust repo found at https://github.com/SurelyShermy/BlueBrilliant
--frontend/
   --bluebrilliantreact/    react build
   --models.py
   --urls.py
   --views.py etc
--dockerfile
--.env                      This is IMPORTANT! you will need to create a file with the following format:
                            MYSQL_DATABASE=dbname
                            MYSQL_ROOT_PASSWORD=dbpass


Also I am not sure why, but even though I have npm run build in the dockerfile, you must run npm run build in the bluebrilliantreact directory.

# Current Features as of 4/21
1. Multiplayer via websocket
2. Player vs engine via websocket
3. Used figma to create the frontend design

# How to play
1. You do not need to login to play the engine! Just click it, and the game will begin. You can only play as white for now (will add option later)
    a. Note that there is no indicator the engine is thinking at the moment. There is a 30s cut off on thinking for now so you will probably need to wait
    b. the engine speeds up as more entries are added to its transposition table
2. For pvp log in to 2 different accounts on the same or multiple browsers. Join the queue. Once both players join the queue, they will be matched. The 2nd person will get an instant load in while the other player might need to wait up to 3 seconds for the polling to finish (this is the last time polling is used for the game)
3. To move pieces, click and drag on the pieces closest to you. (I want to add a flip board button but for now this is the only way to view)
    a. Promotions are not working right now since I dont have a way for a user to select an option. This will come soon

# Planned Features for Demo Day
1. Full forum
2. Beautified ui
3. Puzzles
4. Move data updating next to the board when a move is made, with the ability to load a board on each move (like chess.com)
5. Improved engine, The engine is currently weak because of new techniques in move generation and ab pruning. Going to add more evaluation metrics to improve the engine.

# Project 2 submission acknowledgements
1. Profile picture uploads are not working, and I cant understand why
2. Publishing this is certainly a goal but couldnt complete it
3. Weve lost half our team, please have mercy, The goal for demo day is a completely functioning app with all of the requirements fulfilled.

# Known Issues
1. After a game ends, attempting to join another causes a rust thread panic, probably because of the way my sink ids work
2. Profile pictures upload incorrectly
3. Need to add an indication that the engine is thinking
4. Need to add promotions
5. When playing the engine, if it promotes it will move twice
6. The engine sucks (I know why though)
7. nginx and https is not done, want to complete by demo day
