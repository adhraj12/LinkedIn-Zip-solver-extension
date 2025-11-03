// This script is injected when you click the extension icon on a LinkedIn page.

(async function() {
    console.log("Zip Puzzle Solver Extension: Script injected.");

    // ======================== SELECTOR CONFIGURATION ========================
    const GRID_CONTAINER_SELECTOR = '[data-testid="interactive-grid"]';
    const CELL_SELECTOR = '[data-cell-idx]';
    const CELL_CONTENT_SELECTOR = '[data-cell-content="true"]';
    // LinkedIn has moved from classes to more stable data-testid attributes for walls.
    // TODO: The class for horizontal walls needs to be identified and updated.
    const WALL_DOWN_SELECTOR = '._914a2ded'; 
    const WALL_RIGHT_SELECTOR = '.ef8595d9';


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
        // Use a more generic regex to handle obfuscated CSS variable names
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

        cells.forEach(cell => {
            const idxAttr = cell.getAttribute('data-cell-idx');
            if (idxAttr === null) return;
            const idx = parseInt(idxAttr, 10);
            
            const r = Math.floor(idx / size);
            const c = idx % size;

            const content = cell.querySelector(CELL_CONTENT_SELECTOR);
            if (content?.textContent) {
                grid[r][c] = parseInt(content.textContent.trim(), 10) || 0;
            }

            if (cell.querySelector(WALL_DOWN_SELECTOR) && r < size - 1) {
                horizontalWalls[r][c] = true;
            }
            if (cell.querySelector(WALL_RIGHT_SELECTOR) && c < size - 1) {
                verticalWalls[r][c] = true;
            }
        });
        
        return { grid, horizontalWalls, verticalWalls, size, gridElement };
    }

    /**
     * Draws the solution path on the grid.
     * @param {number[][]} path - The solved path.
     * @param {number} size - The size of the grid.
     * @param {HTMLElement} gridElement - The DOM element of the grid container.
     */
    function drawSolutionPath(path, size, gridElement) {
        const existingSvgId = 'zip-solver-solution-svg';
        const oldSvg = document.getElementById(existingSvgId);
        if (oldSvg) oldSvg.remove();

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

        const firstCell = gridElement.querySelector(CELL_SELECTOR);
        if (!firstCell) return;
        
        const cellSize = firstCell.getBoundingClientRect().width;
        const halfCell = cellSize / 2;
        const strokeWidth = Math.max(4, Math.min(20, cellSize * 0.3));

        const pathData = pathPoints.map(p => {
            const x = p.c * cellSize + halfCell;
            const y = p.r * cellSize + halfCell;
            return `${x},${y}`;
        }).join(' L ');
        const svgPathD = `M ${pathData}`;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = existingSvgId;
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.setAttribute('viewBox', `0 0 ${gridElement.offsetWidth} ${gridElement.offsetHeight}`);

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.id = 'zipPathGradientExt';
        gradient.innerHTML = `
            <stop offset="0%" style="stop-color:#a855f7" /> 
            <stop offset="50%" style="stop-color:#ec4899" />
            <stop offset="100%" style="stop-color:#ef4444" />
        `;
        defs.appendChild(gradient);
        svg.appendChild(defs);

        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.setAttribute('d', svgPathD);
        pathElement.setAttribute('stroke', 'url(#zipPathGradientExt)');
        pathElement.setAttribute('stroke-width', String(strokeWidth));
        pathElement.setAttribute('fill', 'none');
        pathElement.setAttribute('stroke-linecap', 'round');
        pathElement.setAttribute('stroke-linejoin', 'round');
        
        svg.appendChild(pathElement);
        
        if (getComputedStyle(gridElement).position === 'static') {
            gridElement.style.position = 'relative';
        }
        gridElement.appendChild(svg);
    }
    
    try {
        showFeedback('🤖 Solving...');
        
        const result = readGrid();
        if (result) {
            const { grid, horizontalWalls, verticalWalls, size, gridElement } = result;
            // The `solve` function is globally available because solver.js was injected first.
            const solution = solve(grid, horizontalWalls, verticalWalls);
            
            if (solution.success && solution.path.length > 0) {
                drawSolutionPath(solution.path, size, gridElement);
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
