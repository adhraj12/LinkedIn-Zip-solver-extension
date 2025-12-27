// This script is injected when you click the extension icon on a LinkedIn page.

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

(async function () {
    console.log("Zip Puzzle Solver Extension: Script injected.");

    // ======================== SELECTOR CONFIGURATION ========================
    const GRID_CONTAINER_SELECTOR = '[data-testid="interactive-grid"]';
    const CELL_SELECTOR = '[data-cell-idx]';
    const CELL_CONTENT_SELECTOR = '[data-cell-content="true"]';


    /**
     * Shows a feedback message on the screen.
     */
    function showFeedback(message, isError = false) {
        let indicator = document.getElementById('zip-solver-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'zip-solver-indicator';
            indicator.style.position = 'fixed';
            indicator.style.top = '20px';
            indicator.style.right = '20px';
            indicator.style.padding = '12px 20px';
            indicator.style.color = 'white';
            indicator.style.borderRadius = '8px';
            indicator.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            indicator.style.zIndex = '99999';
            indicator.style.fontFamily = 'system-ui, -apple-system, sans-serif';
            indicator.style.fontSize = '16px';
            indicator.style.fontWeight = '500';
            indicator.style.transition = 'opacity 0.3s ease';
            document.body.appendChild(indicator);
        }

        indicator.textContent = message;
        indicator.style.backgroundColor = isError ? '#c53030' : '#2f855a';
        indicator.style.opacity = '1';

        setTimeout(() => {
            if (indicator) indicator.style.opacity = '0';
        }, 4000);
        setTimeout(() => {
            if (indicator) indicator.remove();
        }, 4300);
    }

    /**
     * Reads the current state of the Zip puzzle grid from the DOM.
     * @returns {{grid: number[][], horizontalWalls: boolean[][], verticalWalls: boolean[][], size: number, gridElement: HTMLElement}|null}
     */
    function readGrid() {
        const gridElement = document.querySelector(GRID_CONTAINER_SELECTOR);
        if (!gridElement) {
            showFeedback(`❌ Grid container not found. Check selector: ${GRID_CONTAINER_SELECTOR}`, true);
            return null;
        }

        const style = gridElement.getAttribute('style');
        const sizeMatch = style?.match(/--\w+:\s*(\d+)/);
        if (!sizeMatch?.[1]) {
            showFeedback('❌ Could not determine grid size from style attribute.', true);
            return null;
        }
        const size = parseInt(sizeMatch[1], 10);

        const cells = gridElement.querySelectorAll(CELL_SELECTOR);
        if (cells.length !== size * size) {
            showFeedback(`❌ Expected ${size * size} cells, but found ${cells.length}.`, true);
            return null;
        }

        const grid = Array.from({ length: size }, () => Array(size).fill(0));
        const horizontalWalls = Array.from({ length: size - 1 }, () => Array(size).fill(false));
        const verticalWalls = Array.from({ length: size }, () => Array(size - 1).fill(false));

        // Computed Style-based wall detection.
        // This is more robust than class names as it detects the visual border rendered by ::after.
        // Visual Mapping: Sort cells by screen position to ensure 100% accurate grid mapping
        // This ignores DOM order and data attributes, relying on what the user actually sees.
        const cellData = Array.from(cells).map(cell => {
            const rect = cell.getBoundingClientRect();
            return {
                element: cell,
                x: rect.left + window.scrollX,
                y: rect.top + window.scrollY,
                centerX: rect.left + rect.width / 2,
                centerY: rect.top + rect.height / 2
            };
        });

        // Sort by Y (rows), then X (cols)
        // We use a small tolerance for Y to handle sub-pixel differences
        const ROW_TOLERANCE = 10;
        cellData.sort((a, b) => {
            if (Math.abs(a.y - b.y) > ROW_TOLERANCE) {
                return a.y - b.y;
            }
            return a.x - b.x;
        });

        // Re-order the cells list to match the visual grid
        const sortedCells = cellData.map(d => d.element);

        // Populate grid based on the sorted list
        sortedCells.forEach((cell, i) => {
            const r = Math.floor(i / size);
            const c = i % size;

            const content = cell.querySelector(CELL_CONTENT_SELECTOR);
            if (content?.textContent) {
                grid[r][c] = parseInt(content.textContent.trim(), 10) || 0;
            }

            // Fallback: If no number found yet, try reading the cell's text directly.
            if (grid[r][c] === 0) {
                const rawText = cell.textContent.trim();
                const val = parseInt(rawText, 10);
                if (!isNaN(val) && val > 0) {
                    grid[r][c] = val;
                }
            }

            // Deep Child Scan for Wall Detection
            const descendants = cell.querySelectorAll('*');
            descendants.forEach(child => {
                const afterStyle = window.getComputedStyle(child, '::after');
                const borderRight = parseFloat(afterStyle.borderRightWidth);
                const borderBottom = parseFloat(afterStyle.borderBottomWidth);
                const borderLeft = parseFloat(afterStyle.borderLeftWidth);
                const borderTop = parseFloat(afterStyle.borderTopWidth);

                const WALL_THRESHOLD = 2;

                if (borderRight > WALL_THRESHOLD && c < size - 1) {
                    verticalWalls[r][c] = true;
                }
                if (borderBottom > WALL_THRESHOLD && r < size - 1) {
                    horizontalWalls[r][c] = true;
                }
                if (borderLeft > WALL_THRESHOLD && c > 0) {
                    verticalWalls[r][c - 1] = true;
                }
                if (borderTop > WALL_THRESHOLD && r > 0) {
                    horizontalWalls[r - 1][c] = true;
                }
            });
        });

        return { grid, horizontalWalls, verticalWalls, size, gridElement, cells: sortedCells };
    }

    /**
     * Simulates user interaction to solve the puzzle automatically.
     * @param {number[][]} path - The solved path.
     * @param {number} size - The size of the grid.
     * @param {HTMLElement} gridElement - The DOM element of the grid container.
     * @param {NodeList|Array} cells - The list of cell elements in DOM order.
     */
    async function simulateSolution(path, size, gridElement, cells) {
        const pathPoints = [];
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (path[r][c] > 0) {
                    pathPoints.push({ r, c, step: path[r][c] });
                }
            }
        }
        pathPoints.sort((a, b) => a.step - b.step);

        if (pathPoints.length < 2) return;

        // Use DOM order to retrieve cells, avoiding unreliable data-cell-idx attributes
        const getCell = (r, c) => cells[r * size + c];

        // Helper to create events with coordinates
        const createEvent = (type, x, y, target) => new PointerEvent(type, {
            bubbles: true,
            cancelable: true,
            view: window,
            detail: 1,
            screenX: x, // Approximate
            screenY: y, // Approximate
            clientX: x,
            clientY: y,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            button: 0,
            buttons: 1, // Left button pressed
            pointerId: 1,
            pointerType: 'mouse',
            isPrimary: true,
            pressure: 0.5,
            relatedTarget: null
        });

        // Execute moves
        for (let i = 0; i < pathPoints.length; i++) {
            const { r, c } = pathPoints[i];
            const cell = getCell(r, c);
            if (!cell) continue;

            // CRITICAL FIX: Recalculate coordinates INSTANTLY before clicking.
            // Screen layout might shift (e.g. closing dev tools), so cached data is dangerous.
            const rect = cell.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            // Robust Target Finding
            let target = document.elementFromPoint(x, y);
            if (!target || !cell.contains(target)) {
                target = cell.querySelector(CELL_CONTENT_SELECTOR) || cell;
            }

            if (i === 0) {
                // START
                target.dispatchEvent(createEvent('pointerover', x, y, target));
                target.dispatchEvent(createEvent('pointerenter', x, y, target));
                target.dispatchEvent(createEvent('pointerdown', x, y, target));
                target.dispatchEvent(createEvent('mousedown', x, y, target));
            } else {
                // MOVE: Interpolate to simulate real drag across boundaries
                // We need the previous coordinates to smooth the path
                const prevR = pathPoints[i - 1].r;
                const prevC = pathPoints[i - 1].c;
                const prevCell = getCell(prevR, prevC);

                if (prevCell) {
                    const savedRect = prevCell.getBoundingClientRect(); // Recalculate safely
                    const startX = savedRect.left + savedRect.width / 2;
                    const startY = savedRect.top + savedRect.height / 2;

                    const steps = 5; // 5 intermediate points
                    for (let s = 1; s <= steps; s++) {
                        const t = s / steps;
                        const curX = startX + (x - startX) * t;
                        const curY = startY + (y - startY) * t;

                        const curTarget = document.elementFromPoint(curX, curY) || target;
                        curTarget.dispatchEvent(createEvent('pointermove', curX, curY, curTarget));
                        curTarget.dispatchEvent(createEvent('mousemove', curX, curY, curTarget));

                        // Ultra-fast delay for smoothness
                        await new Promise(r => setTimeout(r, 2));
                    }
                }

                // Final hit on the center
                target.dispatchEvent(createEvent('pointerover', x, y, target));
                target.dispatchEvent(createEvent('pointerenter', x, y, target));
                target.dispatchEvent(createEvent('pointermove', x, y, target));
                target.dispatchEvent(createEvent('mousemove', x, y, target));
            }

            // Keep the speed fast but distinct
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        // END: Mouse up on the last cell
        const last = pathPoints[pathPoints.length - 1];
        const lastCell = getCell(last.r, last.c);
        if (lastCell) {
            // Recalculate for final click too
            const rect = lastCell.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            let lastTarget = document.elementFromPoint(x, y);
            if (!lastTarget || !lastCell.contains(lastTarget)) {
                lastTarget = lastCell.querySelector(CELL_CONTENT_SELECTOR) || lastCell;
            }

            lastTarget.dispatchEvent(createEvent('pointerup', x, y, lastTarget));
            lastTarget.dispatchEvent(createEvent('mouseup', x, y, lastTarget));
            lastTarget.dispatchEvent(createEvent('click', x, y, lastTarget)); // Some games might wait for a click
        }
    }

    try {
        showFeedback('🤖 Solving...');

        const result = readGrid();
        if (result) {
            const { grid, horizontalWalls, verticalWalls, size, gridElement, cells } = result;
            // The `solve` function is now defined in this script.
            const solution = solve(grid, horizontalWalls, verticalWalls);

            if (solution.success && solution.path.length > 0) {
                await simulateSolution(solution.path, size, gridElement, cells);
                showFeedback('✅ Puzzle Solved!');
            } else {
                showFeedback('❌ No solution could be found.', true);
            }
        }
    } catch (error) {
        console.error("Zip Solver Error:", error);
        showFeedback('❌ An unexpected error occurred.', true);
    }
})();