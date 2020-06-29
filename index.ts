/**
 * Match game status
 */
enum MatchGameStatus {
    // The game is progress
    InProgress,

    // 1-1, 2-2, 3-3, 4-4...
    Deuce,

    // 4-3, 3-4, 4-5, 5-4...
    Advantage,

    // 4-0,1,2
    Won,

    // Tie break
    TieBreak
}

/**
 * Class holding match set logics
 */
class MatchSet {
    // All games in a set
    #games: MatchGame[] = []

    // Current match game
    #curentGame: MatchGame | undefined = undefined

    /**
     * Current game
     */
    get currentGame() {
        return this.#curentGame
    }

    // Player 1 won games in this set
    #player1WonGames: number = 0

    /**
     * Player 1 won games count
     */
    get player1WonGames() {
        return this.#player1WonGames
    }

    // Player 2 won games in this set
    #player2WonGames: number = 0

    /**
     * Player 2 won games count
     */
    get player2WonGames() {
        return this.#player2WonGames
    }

    // Is the set over?
    #over: boolean = false

    /**
     * Point won by which player
     * @param player1 Is player1?
     */
    pointWonBy(player1: boolean) {
        // Is set over?
        if(this.#over)
            throw new Error("The game set is over!")

        if(this.#curentGame == null || this.#curentGame.status === MatchGameStatus.Won) {
            // First time or one game is over, to create a new game
            this.#curentGame = new MatchGame()

            // Add to th collection for tracking
            this.#games.push(this.#curentGame)
        }

        // Is a tie-break
        const tieBreak = (this.#player1WonGames === this.#player2WonGames && this.#player1WonGames === 6)
        if(this.#curentGame.pointWonBy(player1, tieBreak) === MatchGameStatus.Won)
        {
            // Game over, who won the point, who is the winner
            if(player1)
                this.#player1WonGames++
            else
                this.#player2WonGames++

            // Game set status update
            if((this.#player1WonGames >= 6 || this.#player2WonGames >= 6) && Math.abs(this.#player1WonGames - this.#player2WonGames) >= 2) {
                this.#over = true
            }
        }
    }

    /**
     * Current match result as string
     */
    toString() {
        return `${this.#player1WonGames}-${this.#player2WonGames}`
    }
}

/**
 * Class holding match games logics
 */
class MatchGame {
    /**
     * Game point history, true for player1, false for player2
     */
    readonly history: boolean [] = []

    // Point label indices
    #pointLabels: string[] = [ '0', '15', '30', '40' ]

    // Player 1 points
    #player1Points: number = 0

    /**
     * Player 1's current game points
     */
    get player1Points() {
        return this.#player1Points
    }

    // Player 2 points
    #player2Points: number = 0

    /**
     * Player 2's current game points
     */
    get player2Points() {
        return this.#player2Points
    }

    #status: MatchGameStatus = MatchGameStatus.InProgress
    /**
     * Is the game over
     */
    get status() {
        return this.#status
    }

    /**
     * Point won by which player
     * @param player1 Is player1?
     * @param tieBreak Is a tie break match
     */
    pointWonBy(player1: boolean, tieBreak: boolean) {
        // Push to the history for track
        this.history.push(player1)

        // Add the point to player
        if(player1) {
            this.#player1Points++
        } else {
            this.#player2Points++
        }

        // Is game over?
        if(tieBreak) {
            this.#status = MatchGameStatus.TieBreak
            if((this.#player1Points >= 7 || this.#player2Points >= 7) && Math.abs(this.#player1Points - this.#player2Points) >= 2) {
                // Match the tie break rule
                // Should have a Won status
                this.#status = MatchGameStatus.Won
            }
        } else {
            if((this.#player1Points >= 4 || this.#player2Points >= 4) && Math.abs(this.#player1Points - this.#player2Points) >= 2) {
                // Match the win rule
                this.#status = MatchGameStatus.Won
            } else if(this.#player1Points === this.#player2Points) {
                // Deuce
                this.#status = MatchGameStatus.Deuce
            } else if(Math.abs(this.#player1Points - this.#player2Points) === 1 && this.#player1Points >= 3 && this.#player2Points >= 3) {
                // Advantage
                this.#status = MatchGameStatus.Advantage
            } else {
                // default, reset to in progress
                this.#status = MatchGameStatus.InProgress
            }
        }

        // Return the status
        return this.#status
    }

    /**
     * Current game result as string
     */
    toString() {
        switch(this.#status)
        {
            case MatchGameStatus.InProgress:
                return `${this.#pointLabels[this.#player1Points]}-${this.#pointLabels[this.#player2Points]}`
            case MatchGameStatus.TieBreak:
                return `${this.#player1Points}-${this.#player2Points}`
            case MatchGameStatus.Deuce:
                // 15-15 described as 15-all, 30-30 described as 30-all
                if(this.#player1Points < 3)
                    return `${this.#pointLabels[this.#player1Points]}-all`
                else
                    return 'Deuce'
            case MatchGameStatus.Advantage:
                return 'Advantage'
            default:
                return ''
        }
    }
}

// Class holding match logics
class Match {
    /**
     * Follow the constraint: Only worry about 1 set
     */
    readonly matchSet: MatchSet

    // Constructor, two players' readonly names, parameter properties
    constructor(readonly player1: string, readonly player2: string) {
        this.matchSet = new MatchSet()
    }

    /**
     * Shortcut for player 1's win
     */
    pointWonByPlayer1() {
        this.matchSet.pointWonBy(true)
    }

    /**
     * Shortcut for player 2's win
     */
    pointWonByPlayer2() {
        this.matchSet.pointWonBy(false)
    }

    /**
     * Add a point to the win player
     * Keep same method with the Java demo
     * Match by string name is not a good idea in real project. Suggest to use pointWonByPlayer1 and pointWonByPlayer2
     * @param name Player's name
     */
    pointWonBy(name: string) {
        if(name === this.player1)
            this.pointWonByPlayer1()
        else
            this.pointWonByPlayer2()
    }

    /**
     * Display the current score
     */
    score() {
        const game = this.matchSet.currentGame
        if(game) {
            const setResult = this.matchSet.toString()
            let gameResult = game.toString()
            if(gameResult) {
                // Attach the advantage player's name
                if(game.status === MatchGameStatus.Advantage)
                    gameResult += ' ' + (game.player1Points > game.player2Points ? this.player1 : this.player2)

                return setResult + ', ' + gameResult
            } else {
                return setResult
            }
        } else {
            return 'Ready to start...'
        }
    }
}

// initialize a Match instance
const match = new Match("player 1", "player 2")

match.pointWonBy("player 1")
match.pointWonBy("player 2")

// this will return "0-0, 15-15"
// Fixed with "0-0, 15-all" according to https://en.wikipedia.org/wiki/Tennis_scoring_system
let result = match.score()
console.log(result)
console.log(result === "0-0, 15-all" ? "passed" : "failed: 0-0, 15-all")

match.pointWonBy("player 1")
match.pointWonBy("player 1")
// this will return "0-0, 40-15"
result = match.score()
console.log(result)
console.log(result === "0-0, 40-15" ? "passed" : "failed: 0-0, 40-15")

match.pointWonBy("player 2")
match.pointWonBy("player 2")
// this will return "0-0, Deuce"
result = match.score()
console.log(result)
console.log(result === "0-0, Deuce" ? "passed" : "failed: 0-0, Deuce")

match.pointWonBy("player 1")
// this will return "0-0, Advantage player 1"
result = match.score()
console.log(result)
console.log(result === "0-0, Advantage player 1" ? "passed" : "failed: 0-0, Advantage player 1")

match.pointWonBy("player 1")
// this will return "1-0"
result = match.score()
console.log(result)
console.log(result === "1-0" ? "passed" : "failed: 1-0")

match.pointWonBy("player 1")
// New game test, this will return "1-0, 15-0"
result = match.score()
console.log(result)
console.log(result === "1-0, 15-0" ? "passed" : "failed: 1-0, 15-0")