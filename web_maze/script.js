function reAssign() {
    window.location.href = "algo.html";
}

const mazeContainer = document.getElementById("maze");
let maze = [];
let userPath = [];
let dfsPath = [];
let bfsPath = [];
let chosenAlgorithm = "";

// Generate random maze
function generateRandomMaze() {
    maze = [];
    for (let i = 0; i < 10; i++) {
        maze.push(
            Array.from({ length: 10 }, () => (Math.random() < 0.2 ? "1" : "0"))
        );
    }
    maze[0][0] = "S"; // Start
    maze[9][9] = "E"; // End

    // Calculate DFS and BFS paths after generating the maze
    const start = { row: 0, col: 0 };
    const end = { row: 9, col: 9 };
    dfsPath = dfs(start, end);
    bfsPath = bfs(start, end);

    renderMaze();
}

// Render the maze
function renderMaze() {
    mazeContainer.innerHTML = "";
    maze.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            const cellDiv = document.createElement("div");
            cellDiv.className = "cell";
            cellDiv.textContent = cell;
            cellDiv.dataset.row = rowIndex;
            cellDiv.dataset.col = cellIndex;
            if (cell === "1") {
                cellDiv.classList.add("wall");
            }
            mazeContainer.appendChild(cellDiv);
        });
    });
}

// BFS algorithm
function bfs(start, end) {
    const queue = [start];
    const visited = new Set();
    const parent = {};
    visited.add(`${start.row},${start.col}`);

    while (queue.length > 0) {
        const current = queue.shift();
        const { row, col } = current;

        if (row === end.row && col === end.col) {
            const path = [];
            let step = current;
            while (step) {
                path.unshift(step);
                step = parent[`${step.row},${step.col}`];
            }
            return path;
        }

        for (const [dRow, dCol] of [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
        ]) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            const key = `${newRow},${newCol}`;
            if (
                newRow >= 0 &&
                newRow < 10 &&
                newCol >= 0 &&
                newCol < 10 &&
                maze[newRow][newCol] !== "1" &&
                !visited.has(key)
            ) {
                queue.push({ row: newRow, col: newCol });
                visited.add(key);
                parent[key] = { row, col };
            }
        }
    }
    return [];
}

// DFS algorithm
function dfs(start, end) {
    const stack = [start];
    const visited = new Set();
    const parent = {};
    visited.add(`${start.row},${start.col}`);

    while (stack.length > 0) {
        const current = stack.pop();
        const { row, col } = current;

        if (row === end.row && col === end.col) {
            const path = [];
            let step = current;
            while (step) {
                path.unshift(step);
                step = parent[`${step.row},${step.col}`];
            }
            return path;
        }

        for (const [dRow, dCol] of [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
        ]) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            const key = `${newRow},${newCol}`;
            if (
                newRow >= 0 &&
                newRow < 10 &&
                newCol >= 0 &&
                newCol < 10 &&
                maze[newRow][newCol] !== "1" &&
                !visited.has(key)
            ) {
                stack.push({ row: newRow, col: newCol });
                visited.add(key);
                parent[key] = { row, col };
            }
        }
    }
    return [];
}

// Add event listeners to buttons and maze cells
function addEventListeners() {
    document.getElementById("solve-dfs").addEventListener("click", () => {
        chosenAlgorithm = "dfs";
        renderCorrectPath(dfsPath);
    });

    document.getElementById("solve-bfs").addEventListener("click", () => {
        chosenAlgorithm = "bfs";
        renderCorrectPath(bfsPath);
    });

    document.getElementById("generate-maze").addEventListener("click", () => {
        generateRandomMaze();
    });

    document.getElementById("try-now-dfs").addEventListener("click", () => {
        chosenAlgorithm = "dfs";
        enableUserPathDrawing();
    });

    document.getElementById("try-now-bfs").addEventListener("click", () => {
        chosenAlgorithm = "bfs";
        enableUserPathDrawing();
    });

    document.getElementById("save-progress").addEventListener("click", () => {
        localStorage.setItem("maze", JSON.stringify(maze));
        localStorage.setItem("userPath", JSON.stringify(userPath));
        alert("Progress saved!");
    });

    document.getElementById("load-progress").addEventListener("click", () => {
        const savedMaze = JSON.parse(localStorage.getItem("maze"));
        const savedUserPath = JSON.parse(localStorage.getItem("userPath"));
        if (savedMaze && savedUserPath) {
            maze = savedMaze;
            userPath = savedUserPath;
            renderMaze();
            userPath.forEach(({ row, col }) => {
                const cell = document.querySelector(
                    `.cell[data-row='${row}'][data-col='${col}']`
                );
                if (cell) cell.classList.add("marked");
            });
            alert("Progress loaded!");
        } else {
            alert("No saved progress found!");
        }
    });

    // Show Hint button with blink effect
    document.getElementById("show-hint").addEventListener("click", () => {
        if (chosenAlgorithm === "dfs") {
            blinkPath(dfsPath, "yellow");
        } else if (chosenAlgorithm === "bfs") {
            blinkPath(bfsPath, "yellow");
        }
    });

    mazeContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("cell")) {
            const row = event.target.dataset.row;
            const col = event.target.dataset.col;

            if (maze[row][col] !== "1") {
                if (chosenAlgorithm) {
                    if (
                        chosenAlgorithm === "dfs" &&
                        dfsPath.some((p) => p.row == row && p.col == col)
                    ) {
                        event.target.classList.add("marked");
                        userPath.push({ row: parseInt(row), col: parseInt(col) });
                    } else if (
                        chosenAlgorithm === "bfs" &&
                        bfsPath.some((p) => p.row == row && p.col == col)
                    ) {
                        event.target.classList.add("marked");
                        userPath.push({ row: parseInt(row), col: parseInt(col) });
                    } else {
                        event.target.classList.add("red");
                        setTimeout(() => event.target.classList.remove("red"), 1000);
                    }
                }
            } else {
                alert("Cannot pass through wall.");
            }
        }
    });
}

// Blink the correct path for 1 second using a different color
function blinkPath(path, color) {
    path.forEach(({ row, col }) => {
        const cell = document.querySelector(
            `.cell[data-row='${row}'][data-col='${col}']`
        );
        if (cell) {
            cell.style.backgroundColor = color; // Set the color for blinking
        }
    });

    setTimeout(() => {
        path.forEach(({ row, col }) => {
            const cell = document.querySelector(
                `.cell[data-row='${row}'][data-col='${col}']`
            );
            if (cell) {
                cell.style.backgroundColor = ""; // Reset the color after 1 second
            }
        });
    }, 1000);
}

// Enable drawing user path
function enableUserPathDrawing() {
    userPath = [];
    mazeContainer.classList.add("drawing");
}

// Initialize the game
function initializeGame() {
    generateRandomMaze();
    addEventListeners();
}

initializeGame();
