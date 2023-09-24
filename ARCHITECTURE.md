# Architecture

## Server

The server stores different kinds of data (users, items, purchased items), serves two kinds of requests - game reports (`/played`), and purchased items (`/purchases`).

A game report includes the following:
- telegram web app init data (for authentication)
- the score for that game
- optionally, the wallet for the reward (only necessary for the first time, cannot be changed later)

Upon getting a game report, the server does the following:
1. Checks telegram web app init data, parses it and retrieves the user ID
2. Stores the user in the database if it didn't exist, increments its play count, and updates the high score
3. Schedules the rewards (tokens + SBT achievements) using the scheduler (see below) according to some simple rules
4. Returns the number of tokens awarded and new achievements (if any)

When purchased items are requested, the server:
1. Checks telegram web app init data, parses it and retrieves the user ID
2. Fetches this user's purchases from the DB
3. Returns these purchases

In order to be able to send rewards to many users at once, the server utilizes a highload wallet, but it is optimal to "batch" as many rewards in a single wallet request as possible because wallet requests have a constant cost to them.

To do this, the server uses two classes: a `Scheduler` and an `Executor`.

`Scheduler` basically just debounces (using a trailing edge) the rewards, and passes the current batch all at once to the `Executor` once either the wait time (5 seconds) since the last reward has elapsed, or once the action limit is reached (100 rewards).

`Executor` assembles wallet requests (by using a batched SBT minter op) and executes them, taking into account the weird way of how Node works (event loop and async functions), making sure not to submit more than one batch at a time (although the highload wallet is capable of accepting more than one at a time).

The purchases are checked in the following way:
1. Every 10 seconds, the server requests the last known transaction's ID (hash + LT) on the token recipient address from an API
2. If it is the same as the one already in memory, this check cycle is skipped, and this loop sleeps for another 10s
3. Otherwise, the server repeatedly asks the API for the transaction list (which is paginated) until it encounters the last known transaction ID that the server knows (if there is one), or to the end of the list (if the server knows no transactions)
4. From that list, only the transactions received from the token recipient's jetton wallet are taken into account
5. The server tries to parse each of them as a `transfer_notification` (see [TEP74](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md)), and if it is successful and the comment is of the form `<user_id:number>:<item_id:number>`, it is treated as a purchase request with that user id and item id
6. The server gets the costs of all items that are referenced in the purchase requests, and stores all purchases that have the token amount greater than or equal to the respective item cost

## Game (web app)

Whenever the game is over, a play report is sent to the server along with the telegram web app init data and the wallet address taken from the TON Connect button. The server may award tokens and/or SBT achievements to that address as a result of that game.

Whenever the shop is opened, purchases are requested from the server, the first item (green pipe) is always allowed to be used, but the other items (currently, only the red pipe) are only allowed to be used if purchased (indicated in the `purchases` array of the API response). This list is rechecked every 10 seconds and the UI is redrawn to display any changes.

Along with the `purchases` request, the game also checks the jetton balance of the player and displays it. The user may choose to buy any locked items, and a purchase request will be displayed via TON Connect.

If the user does purchase something, the server will automatically detect it, and the shop UI will be updated once a shop reload happens.

