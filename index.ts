namespace Matrix {
    export function findMatrixShape(x: number[][]) {
        let numRows = x.length
        let numColumns = x[0].length

        return {
            rows: numRows,
            columns: numColumns,
        }
    }

    export function multiply(a: number[][], b: number[][]) {
        let aShape = findMatrixShape(a)
        let bShape = findMatrixShape(b)

        if (aShape.columns !== bShape.rows) {
            throw `Cannot perform matrix multipication on ${aShape.rows}x${aShape.columns} and ${bShape.rows}x${bShape.columns}!`
        }

        let resultMatrix: number[][] = []
        for (let i = 0; i < aShape.rows; i++) {
            resultMatrix[i] = []
            for (let j = 0; j < bShape.columns; j++) {
                resultMatrix[i][j] = 0
                for (let k = 0; k < aShape.columns; k++) {
                    resultMatrix[i][j] += a[i][k] * b[k][j]
                }
            }
        }

        return resultMatrix
    }

    export function transpose(x: number[][]) {
        let xShape = findMatrixShape(x)
        let resultMatrix: number[][] = []

        for (let i = 0; i < xShape.columns; i++) {
            resultMatrix[i] = []
            for (let j = 0; j < xShape.rows; j++) {
                resultMatrix[i][j] = x[j][i]
            }
        }

        return resultMatrix
    }

    export function trace(x: number[][]) {
        let xShape = findMatrixShape(x)
        if (xShape.rows !== xShape.columns) {
            throw `Cannot calculate trace for matrix with shape ${xShape.rows}x${xShape.columns}`
        }

        let result = 0
        for (let i = 0; i < xShape.rows; i++) {
            result += x[i][i]
        }

        return result
    }
}

namespace TicTacToe {
    export const TILE_WIDTH = 100
    export const SEP_WIDTH = 10
    export const GAME_WIDTH = TILE_WIDTH * 3 + SEP_WIDTH * 2
    export const GAME_HEIGHT = TILE_WIDTH * 3 + SEP_WIDTH * 2
    /**
     *  0: nothing
     *  1: X
     * -1: O
     */
    export const X = 1
    export const O = -1

    export class Game {
        canvas: HTMLCanvasElement
        ctx: CanvasRenderingContext2D
        scale: number
        offset: { x: number, y: number }
        turn: number
        board: number[][]
        fps: number
        loading: boolean
        loadingTimeout: number
        loadingImage?: HTMLImageElement
        startImage?: HTMLImageElement
        started: boolean
        matchEventHandler: (evt: MouseEvent) => void

        constructor(id: string, loadingImageURL?: string, startImageURL?: string) {
            let canvas = document.getElementById(id)
            if (canvas === null) {
                throw `Element with ID ${id} does not exists!`
            }

            if (!(canvas instanceof HTMLCanvasElement)) {
                console.log(canvas)
                throw `Element with ID ${id} is not a canvas!`
            }

            this.canvas = canvas
            this.canvas.width = GAME_WIDTH
            this.canvas.height = GAME_HEIGHT

            let ctx = canvas.getContext('2d')
            if (ctx === null) {
                throw `This browser does not support CanvasRenderingContext2D!`
            }
            this.ctx = ctx

            this.scale = 1
            this.offset = {
                x: 0,
                y: 0,
            }

            this.turn = X

            this.board = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ]

            this.fps = 20
            this.loadingTimeout = 3000
            this.loading = true

            if (loadingImageURL) {
                this.loadingImage = new Image()
                this.loadingImage.src = loadingImageURL
            }

            if (startImageURL) {
                this.startImage = new Image()
                this.startImage.src = startImageURL
            }

            this.started = false
            this.matchEventHandler = this.handleMouseupEvent.bind(this)
        }

        calculateDimemsion() {
            this.scale = Math.min(
                window.innerWidth / GAME_WIDTH,
                window.innerHeight / GAME_HEIGHT,
            )

            this.offset = {
                x: (window.innerWidth - (GAME_WIDTH * this.scale)) / 2,
                y: (window.innerHeight - (GAME_HEIGHT * this.scale)) / 2,
            }
        }

        resize() {
            this.calculateDimemsion()
            this.canvas.style.transform = `scale(${this.scale})`
            this.canvas.style.left = `${this.offset.x}px`
            this.canvas.style.top = `${this.offset.y}px`
        }

        drawLine(x1: number, y1: number, x2: number, y2: number, lineWidth: number, style: string) {
            this.ctx.lineWidth = lineWidth
            this.ctx.strokeStyle = style
            this.ctx.beginPath()
            this.ctx.moveTo(x1, y1)
            this.ctx.lineTo(x2, y2)
            this.ctx.closePath()
            this.ctx.stroke()
        }

        drawGrid() {
            this.ctx.fillStyle = 'rgba(0,255,255,1)'
            this.ctx.fillRect(0, TILE_WIDTH, GAME_WIDTH, SEP_WIDTH)
            this.ctx.fillRect(0, TILE_WIDTH * 2 + SEP_WIDTH, GAME_WIDTH, SEP_WIDTH)
            this.ctx.fillRect(TILE_WIDTH, 0, SEP_WIDTH, GAME_HEIGHT)
            this.ctx.fillRect(TILE_WIDTH * 2 + SEP_WIDTH, 0, SEP_WIDTH, GAME_HEIGHT)
        }

        drawX(x: number, y: number) {
            let line1 = {
                start: {
                    x: TILE_WIDTH * 0.1 + x * (TILE_WIDTH + SEP_WIDTH),
                    y: TILE_WIDTH * 0.1 + y * (TILE_WIDTH + SEP_WIDTH),
                },
                end: {
                    x: TILE_WIDTH * 0.9 + x * (TILE_WIDTH + SEP_WIDTH),
                    y: TILE_WIDTH * 0.9 + y * (TILE_WIDTH + SEP_WIDTH),
                },
            }

            let line2 = {
                start: {
                    x: TILE_WIDTH * 0.1 + x * (TILE_WIDTH + SEP_WIDTH),
                    y: TILE_WIDTH * 0.9 + y * (TILE_WIDTH + SEP_WIDTH),
                },
                end: {
                    x: TILE_WIDTH * 0.9 + x * (TILE_WIDTH + SEP_WIDTH),
                    y: TILE_WIDTH * 0.1 + y * (TILE_WIDTH + SEP_WIDTH),
                },
            }

            let lineWidth = TILE_WIDTH * 0.1
            let style = 'rgba(255,0,0,1)'
            this.drawLine(line1.start.x, line1.start.y, line1.end.x, line1.end.y, lineWidth, style)
            this.drawLine(line2.start.x, line2.start.y, line2.end.x, line2.end.y, lineWidth, style)
        }

        drawO(x: number, y: number) {
            this.ctx.lineWidth = TILE_WIDTH * 0.1
            this.ctx.strokeStyle = 'rgba(0,0,255,1)'
            let radius = TILE_WIDTH * 0.4

            let origin = {
                x: TILE_WIDTH * 0.5 + x * (TILE_WIDTH + SEP_WIDTH),
                y: TILE_WIDTH * 0.5 + y * (TILE_WIDTH + SEP_WIDTH),
            }

            this.ctx.beginPath()
            this.ctx.arc(origin.x, origin.y, radius, 0, 2 * Math.PI)
            this.ctx.closePath()
            this.ctx.stroke()
        }

        drawBoard() {
            for (let i = 0; i < this.board.length; i++) {
                for (let j = 0; j < this.board[i].length; j++) {
                    if (this.board[i][j] === X) {
                        this.drawX(j, i)
                    } else if (this.board[i][j] === O) {
                        this.drawO(j, i)
                    }
                }
            }
        }

        render() {
            this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
            this.drawGrid()
            this.drawBoard()
        }

        floatToInt(x: number) {
            return (x - (x % 1))
        }

        mapTouchPosToTile(x: number, y: number) {
            let pos = {
                x: (x - this.offset.x) / this.scale,
                y: (y - this.offset.y) / this.scale,
            }

            let tilePos = {
                x: this.floatToInt(pos.x / (GAME_WIDTH / 3)),
                y: this.floatToInt(pos.y / (GAME_HEIGHT / 3)),
            }

            return tilePos
        }

        checkMatch() {
            // https://math.stackexchange.com/questions/467757/determine-the-winner-of-a-tic-tac-toe-board-with-a-single-matrix-expression
            let results = []

            let eMatrices = [
                [[1], [0], [0]],
                [[0], [1], [0]],
                [[0], [0], [1]],
            ]
            let aMatrix = [[1, 1, 1]]

            for (let i = 0; i < eMatrices.length; i++) {
                let se = Matrix.multiply(this.board, eMatrices[i])
                let ase = Matrix.multiply(aMatrix, se)
                results.push(ase[0][0])
            }

            let sT = Matrix.transpose(this.board)
            for (let i = 0; i < eMatrices.length; i++) {
                let se = Matrix.multiply(sT, eMatrices[i])
                let ase = Matrix.multiply(aMatrix, se)
                results.push(ase[0][0])
            }

            results.push(Matrix.trace(this.board))

            // Permute (swap) rows
            let P = [
                [0, 0, 1],
                [0, 1, 0],
                [1, 0, 0],
            ]

            let Ps = Matrix.multiply(P, this.board)
            results.push(Matrix.trace(Ps))

            let winner = 0
            for (let i = 0; i < results.length; i++) {
                if (results[i] === 3) {
                    // X wins
                    winner = X
                    break
                } else if (results[i] === -3) {
                    // O wins
                    winner = O
                    break
                }
            }

            return winner
        }

        resetMatch() {
            this.turn = X

            this.board = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ]
        }

        handleMouseupEvent(evt: MouseEvent) {
            if (this.started) {
                let tilePos = this.mapTouchPosToTile(evt.x, evt.y)

                if (this.board[tilePos.y][tilePos.x] !== 0) {
                    return
                }

                this.board[tilePos.y][tilePos.x] = this.turn
                this.turn = -this.turn
                this.render()

                let winner = this.checkMatch()

                if (winner !== 0) {
                    this.startNewGame()
                }
            } else {
                this.started = true
                this.resetMatch()
                this.render()
            }
        }

        attach() {
            this.resize()
            // attach events
            window.addEventListener('resize', this.resize.bind(this))
        }

        renderStartScreen() {
            this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

            if (this.startImage) {
                let offset = {
                    x: (this.canvas.width - this.startImage.width) / 2,
                    y: (this.canvas.height - this.startImage.height) / 2,
                }

                this.ctx.drawImage(this.startImage, offset.x, offset.y)
            }
        }

        startNewGame() {
            this.started = false
            this.renderStartScreen()
        }

        renderLoadingScreen(alpha: number) {
            this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

            if (this.loadingImage) {
                let offset = {
                    x: (this.canvas.width - this.loadingImage.width) / 2,
                    y: (this.canvas.height - this.loadingImage.height) / 2,
                }

                let previousAlpha = this.ctx.globalAlpha
                this.ctx.globalAlpha = alpha
                this.ctx.drawImage(this.loadingImage, offset.x, offset.y)
                this.ctx.globalAlpha = previousAlpha
            }
        }

        run() {
            let that = this

            // Play the loading screen.
            let drawInterval = 1000 / this.fps
            let numDrawCalls = this.loadingTimeout / drawInterval
            numDrawCalls = this.floatToInt(numDrawCalls)

            // We will update 20 times per second
            // The loading image alpha will change from 1 to 0 in 1 second

            let alpha = 1
            for (let i = 0; i < numDrawCalls; i++) {
                let _i = i % this.fps
                if (_i === 0) {
                    if (alpha > 0.5) {
                        alpha = 1
                    } else {
                        alpha = 0
                    }
                } else {
                    alpha = _i / this.fps
                }

                if ((i % (this.fps * 2)) > this.fps) {
                    alpha = 1 - alpha
                }

                let drawAfter = i * drawInterval

                let safeAlpha = alpha

                setTimeout(function () {
                    that.renderLoadingScreen.bind(that)(safeAlpha)
                }, drawAfter)
            }

            // If we were actually loading assets, I think we should finish the loading process here.
            setTimeout(function () {
                that.loading = false
                that.canvas.addEventListener('mouseup', that.matchEventHandler)
                that.startNewGame()
            }, numDrawCalls * drawInterval)
        }
    }
}

let loadingImageURL = 'loading_x2.png'
let startImageURL = 'start_x3.png'

let app = new TicTacToe.Game('main', loadingImageURL, startImageURL)
app.attach()
app.run()