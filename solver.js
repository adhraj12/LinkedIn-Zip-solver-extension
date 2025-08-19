// This function will be available in the global scope of the injected script execution context.
const solve = (board, horizontalWalls, verticalWalls) => {
    const rows = board.length;
    if (rows === 0) return { success: false, path: [] };
    const cols = board[0].length;
    
    const dots = {};
    const totalPathLength = rows * cols;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] > 0) {
                dots[board[r][c]] = { r, c };
            }
        }
    }
    
    const dotNumbers = Object.keys(dots).map(Number);
    if (dotNumbers.length === 0) {
        return { success: totalPathLength <= 1, path: totalPathLength === 1 ? [[1]] : [] };
    }
    
    const maxDot = Math.max(...dotNumbers);
    const startPos = dots[1];

    if (!startPos) return { success: false, path: [] }; 

    const path = Array.from({ length: rows }, () => Array(cols).fill(0));

    const findPath = (r, c, step, currentDot) => {
        if (r < 0 || r >= rows || c < 0 || c >= cols || path[r][c] !== 0) {
            return false;
        }

        let nextDot = currentDot;
        const cellValue = board[r][c];

        if (cellValue > 0) {
            if (cellValue === currentDot + 1) {
                nextDot++;
            } else if (cellValue !== currentDot) {
                return false;
            }
        }
        
        path[r][c] = step;

        if (cellValue === maxDot && step === totalPathLength) {
            return true;
        }

        if (step === totalPathLength) {
            path[r][c] = 0;
            return false;
        }

        // --- Wall-aware direction checking ---
        // Right
        if (c < cols - 1 && !verticalWalls[r][c]) {
            if (findPath(r, c + 1, step + 1, nextDot)) return true;
        }
        // Left
        if (c > 0 && !verticalWalls[r][c - 1]) {
            if (findPath(r, c - 1, step + 1, nextDot)) return true;
        }
        // Down
        if (r < rows - 1 && !horizontalWalls[r][c]) {
            if (findPath(r + 1, c, step + 1, nextDot)) return true;
        }
        // Up
        if (r > 0 && !horizontalWalls[r - 1][c]) {
            if (findPath(r - 1, c, step + 1, nextDot)) return true;
        }

        // Backtrack
        path[r][c] = 0;
        return false;
    };

    const success = findPath(startPos.r, startPos.c, 1, 1);

    return { success, path };
};
