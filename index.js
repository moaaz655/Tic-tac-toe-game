'use strict';
var Matrix;
(function (Matrix) {
  function findMatrixShape(x) {
    let numRows = x.length;
    let numColumns = x[0].length;
    return {
      rows: numRows,
      columns: numColumns,
    };
  }
  Matrix.findMatrixShape = findMatrixShape;
  function multiply(a, b) {
    let aShape = findMatrixShape(a);
    let bShape = findMatrixShape(b);
    if (aShape.columns !== bShape.rows) {
      throw `Cannot perform matrix multipication on ${aShape.rows}x${aShape.columns} and ${bShape.rows}x${bShape.columns}!`;
    }
    let resultMatrix = [];
    for (let i = 0; i < aShape.rows; i++) {
      resultMatrix[i] = [];
      for (let j = 0; j < bShape.columns; j++) {
        resultMatrix[i][j] = 0;
        for (let k = 0; k < aShape.columns; k++) {
          resultMatrix[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return resultMatrix;
  }
  Matrix.multiply = multiply;
  function transpose(x) {
    let xShape = findMatrixShape(x);
    let resultMatrix = [];
    for (let i = 0; i < xShape.columns; i++) {
      resultMatrix[i] = [];
      for (let j = 0; j < xShape.rows; j++) {
        resultMatrix[i][j] = x[j][i];
      }
    }
    return resultMatrix;
  }
  Matrix.transpose = transpose;
  function trace(x) {
    let xShape = findMatrixShape(x);
    if (xShape.rows !== xShape.columns) {
      throw `Cannot calculate trace for matrix with shape ${xShape.rows}x${xShape.columns}`;
    }
    let result = 0;
    for (let i = 0; i < xShape.rows; i++) {
      result += x[i][i];
    }
    return result;
  }
  Matrix.trace = trace;
})(Matrix || (Matrix = {}));
var TicTacToe;
(function (TicTacToe) {
  TicTacToe.TILE_WIDTH = 100;
  TicTacToe.SEP_WIDTH = 10;
  TicTacToe.GAME_WIDTH = TicTacToe.TILE_WIDTH * 3 + TicTacToe.SEP_WIDTH * 2;
  TicTacToe.GAME_HEIGHT = TicTacToe.TILE_WIDTH * 3 + TicTacToe.SEP_WIDTH * 2;
  /**
   *  0: nothing
   *  1: X
   * -1: O
   */
  TicTacToe.X = 1;
  TicTacToe.O = -1;
  class Game {
    constructor(id, loadingImageURL, startImageURL) {
      let canvas = document.getElementById(id);
      if (canvas === null) {
        throw `Element with ID ${id} does not exists!`;
      }
      if (!(canvas instanceof HTMLCanvasElement)) {
        console.log(canvas);
        throw `Element with ID ${id} is not a canvas!`;
      }
      this.canvas = canvas;
      this.canvas.width = TicTacToe.GAME_WIDTH;
      this.canvas.height = TicTacToe.GAME_HEIGHT;
      let ctx = canvas.getContext('2d');
      if (ctx === null) {
        throw `This browser does not support CanvasRenderingContext2D!`;
      }
      this.ctx = ctx;
      this.scale = 1;
      this.offset = {
        x: 0,
        y: 0,
      };
      this.turn = TicTacToe.X;
      this.board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      this.fps = 20;
      this.loadingTimeout = 3000;
      this.loading = true;
      if (loadingImageURL) {
        this.loadingImage = new Image();
        this.loadingImage.src = loadingImageURL;
      }
      if (startImageURL) {
        this.startImage = new Image();
        this.startImage.src = startImageURL;
      }
      this.started = false;
      this.matchEventHandler = this.handleMouseupEvent.bind(this);
    }
    calculateDimemsion() {
      this.scale = Math.min(
        window.innerWidth / TicTacToe.GAME_WIDTH,
        window.innerHeight / TicTacToe.GAME_HEIGHT
      );
      this.offset = {
        x: (window.innerWidth - TicTacToe.GAME_WIDTH * this.scale) / 2,
        y: (window.innerHeight - TicTacToe.GAME_HEIGHT * this.scale) / 2,
      };
    }
    resize() {
      this.calculateDimemsion();
      this.canvas.style.transform = `scale(${this.scale})`;
      this.canvas.style.left = `${this.offset.x}px`;
      this.canvas.style.top = `${this.offset.y}px`;
    }
    drawLine(x1, y1, x2, y2, lineWidth, style) {
      this.ctx.lineWidth = lineWidth;
      this.ctx.strokeStyle = style;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.closePath();
      this.ctx.stroke();
    }
    drawGrid() {
      this.ctx.fillStyle = 'rgba(0,255,255,1)';
      this.ctx.fillRect(
        0,
        TicTacToe.TILE_WIDTH,
        TicTacToe.GAME_WIDTH,
        TicTacToe.SEP_WIDTH
      );
      this.ctx.fillRect(
        0,
        TicTacToe.TILE_WIDTH * 2 + TicTacToe.SEP_WIDTH,
        TicTacToe.GAME_WIDTH,
        TicTacToe.SEP_WIDTH
      );
      this.ctx.fillRect(
        TicTacToe.TILE_WIDTH,
        0,
        TicTacToe.SEP_WIDTH,
        TicTacToe.GAME_HEIGHT
      );
      this.ctx.fillRect(
        TicTacToe.TILE_WIDTH * 2 + TicTacToe.SEP_WIDTH,
        0,
        TicTacToe.SEP_WIDTH,
        TicTacToe.GAME_HEIGHT
      );
    }
    drawX(x, y) {
      let line1 = {
        start: {
          x:
            TicTacToe.TILE_WIDTH * 0.1 +
            x * (TicTacToe.TILE_WIDTH + TicTacToe.SEP_WIDTH),
          y:
            TicTacToe.TILE_WIDTH * 0.1 +
            y * (TicTacToe.TILE_WIDTH + TicTacToe.SEP_WIDTH),
        },
        end: {
          x:
            TicTacToe.TILE_WIDTH * 0.9 +
            x * (TicTacToe.TILE_WIDTH + TicTacToe.SEP_WIDTH),
          y:
            TicTacToe.TILE_WIDTH * 0.9 +
            y * (TicTacToe.TILE_WIDTH + TicTacToe.SEP_WIDTH),
        },
      };
      let line2 = {
        start: {
          x:
            TicTacToe.TILE_WIDTH * 0.1 +
            x * (TicTacToe.TILE_WIDTH + TicTacToe.SEP_WIDTH),
          y:
            TicTacToe.TILE_WIDTH * 0.9 +
            y * (TicTacToe.TILE_WIDTH + TicTacToe.SEP_WIDTH),
        },
        end: {
          x:
            TicTacToe.TILE_WIDTH * 0.9 +
            x * (TicTacToe.TILE_WIDTH + TicTacToe.SEP_WIDTH),
          y:
            TicTacToe.TILE_WIDTH * 0.1 +
            y * (TicTacToe.TILE_WIDTH + TicTacToe.SEP_WIDTH),
        },
      };
      let lineWidth = TicTacToe.TILE_WIDTH * 0.1;
      let style = 'rgba(255,0,0,1)';
      this.drawLine(
        line1.start.x,
        line1.start.y,
        line1.end.x,
        line1.end.y,
        lineWidth,
        style
      );
      this.drawLine(
        line2.start.x,
        line2.start.y,
        line2.end.x,
        line2.end.y,
        lineWidth,
        style
      );
    }
    drawO(x, y) {
      this.ctx.lineWidth = TicTacToe.TILE_WIDTH * 0.1;
      this.ctx.strokeStyle = 'rgba(0,0,255,1)';
      let radius = TicTacToe.TILE_WIDTH * 0.4;
      let origin = {
        x:
          TicTacToe.TILE_WIDTH * 0.5 +
          x * (TicTacToe.TILE_WIDTH + TicTacToe.SEP_WIDTH),
        y:
          TicTacToe.TILE_WIDTH * 0.5 +
          y * (TicTacToe.TILE_WIDTH + TicTacToe.SEP_WIDTH),
      };
      this.ctx.beginPath();
      this.ctx.arc(origin.x, origin.y, radius, 0, 2 * Math.PI);
      this.ctx.closePath();
      this.ctx.stroke();
    }
    drawBoard() {
      for (let i = 0; i < this.board.length; i++) {
        for (let j = 0; j < this.board[i].length; j++) {
          if (this.board[i][j] === TicTacToe.X) {
            this.drawX(j, i);
          } else if (this.board[i][j] === TicTacToe.O) {
            this.drawO(j, i);
          }
        }
      }
    }
    render() {
      this.ctx.clearRect(0, 0, TicTacToe.GAME_WIDTH, TicTacToe.GAME_HEIGHT);
      this.drawGrid();
      this.drawBoard();
    }
    floatToInt(x) {
      return x - (x % 1);
    }
    mapTouchPosToTile(x, y) {
      let pos = {
        x: (x - this.offset.x) / this.scale,
        y: (y - this.offset.y) / this.scale,
      };
      let tilePos = {
        x: this.floatToInt(pos.x / (TicTacToe.GAME_WIDTH / 3)),
        y: this.floatToInt(pos.y / (TicTacToe.GAME_HEIGHT / 3)),
      };
      return tilePos;
    }
    checkMatch() {
      // https://math.stackexchange.com/questions/467757/determine-the-winner-of-a-tic-tac-toe-board-with-a-single-matrix-expression
      let results = [];
      let eMatrices = [
        [[1], [0], [0]],
        [[0], [1], [0]],
        [[0], [0], [1]],
      ];
      let aMatrix = [[1, 1, 1]];
      for (let i = 0; i < eMatrices.length; i++) {
        let se = Matrix.multiply(this.board, eMatrices[i]);
        let ase = Matrix.multiply(aMatrix, se);
        results.push(ase[0][0]);
      }
      let sT = Matrix.transpose(this.board);
      for (let i = 0; i < eMatrices.length; i++) {
        let se = Matrix.multiply(sT, eMatrices[i]);
        let ase = Matrix.multiply(aMatrix, se);
        results.push(ase[0][0]);
      }
      results.push(Matrix.trace(this.board));
      // Permute (swap) rows
      let P = [
        [0, 0, 1],
        [0, 1, 0],
        [1, 0, 0],
      ];
      let Ps = Matrix.multiply(P, this.board);
      results.push(Matrix.trace(Ps));
      let winner = 0;
      for (let i = 0; i < results.length; i++) {
        if (results[i] === 3) {
          // X wins
          winner = TicTacToe.X;
          break;
        } else if (results[i] === -3) {
          // O wins
          winner = TicTacToe.O;
          break;
        }
      }
      return winner;
    }
    resetMatch() {
      this.turn = TicTacToe.X;
      this.board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
    }
    handleMouseupEvent(evt) {
      if (this.started) {
        let tilePos = this.mapTouchPosToTile(evt.x, evt.y);
        if (this.board[tilePos.y][tilePos.x] !== 0) {
          return;
        }
        this.board[tilePos.y][tilePos.x] = this.turn;
        this.turn = -this.turn;
        this.render();
        let winner = this.checkMatch();
        if (winner !== 0) {
          this.startNewGame();
        }
      } else {
        this.started = true;
        this.resetMatch();
        this.render();
      }
    }
    attach() {
      this.resize();
      // attach events
      window.addEventListener('resize', this.resize.bind(this));
    }
    renderStartScreen() {
      this.ctx.clearRect(0, 0, TicTacToe.GAME_WIDTH, TicTacToe.GAME_HEIGHT);
      if (this.startImage) {
        let offset = {
          x: (this.canvas.width - this.startImage.width) / 2,
          y: (this.canvas.height - this.startImage.height) / 2,
        };
        this.ctx.drawImage(this.startImage, offset.x, offset.y);
      }
    }
    startNewGame() {
      this.started = false;
      this.renderStartScreen();
    }
    renderLoadingScreen(alpha) {
      this.ctx.clearRect(0, 0, TicTacToe.GAME_WIDTH, TicTacToe.GAME_HEIGHT);
      if (this.loadingImage) {
        let offset = {
          x: (this.canvas.width - this.loadingImage.width) / 2,
          y: (this.canvas.height - this.loadingImage.height) / 2,
        };
        let previousAlpha = this.ctx.globalAlpha;
        this.ctx.globalAlpha = alpha;
        this.ctx.drawImage(this.loadingImage, offset.x, offset.y);
        this.ctx.globalAlpha = previousAlpha;
      }
    }
    run() {
      let that = this;
      // Play the loading screen.
      let drawInterval = 1000 / this.fps;
      let numDrawCalls = this.loadingTimeout / drawInterval;
      numDrawCalls = this.floatToInt(numDrawCalls);
      // We will update 20 times per second
      // The loading image alpha will change from 1 to 0 in 1 second
      let alpha = 1;
      for (let i = 0; i < numDrawCalls; i++) {
        let _i = i % this.fps;
        if (_i === 0) {
          if (alpha > 0.5) {
            alpha = 1;
          } else {
            alpha = 0;
          }
        } else {
          alpha = _i / this.fps;
        }
        if (i % (this.fps * 2) > this.fps) {
          alpha = 1 - alpha;
        }
        let drawAfter = i * drawInterval;
        let safeAlpha = alpha;
        setTimeout(function () {
          that.renderLoadingScreen.bind(that)(safeAlpha);
        }, drawAfter);
      }
      // If we were actually loading assets, I think we should finish the loading process here.
      setTimeout(function () {
        that.loading = false;
        that.canvas.addEventListener('mouseup', that.matchEventHandler);
        that.startNewGame();
      }, numDrawCalls * drawInterval);
    }
  }
  TicTacToe.Game = Game;
})(TicTacToe || (TicTacToe = {}));
let loadingImageURL = 'loading_x2.png';
let startImageURL = 'start_x3.png';
let app = new TicTacToe.Game('main', loadingImageURL, startImageURL);
app.attach();
app.run();
//# sourceMappingURL=index.js.map
