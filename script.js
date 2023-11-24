const isMobile = isMobileDevice()
const rangeBar = document.querySelector('.range-bar')
const minPoint = document.querySelector('.min-point')
const maxPoint = document.querySelector('.max-point')
const minCover = document.querySelector('.min-cover')
const maxCover = document.querySelector('.max-cover')
const inputMinValue = document.querySelector('.range-bar__enter_min')
const inputMaxValue = document.querySelector('.range-bar__enter_max')
const upperLineRange = document.querySelector('.range-bar__line_fill')
const range = initRangeBar()

// Init range ==============================================================
function isMobileDevice() {
    return 'ontouchstart' in window ||
        (window.DocumentTouch && document instanceof window.DocumentTouch) ||
        navigator.maxTouchPoints > 0 ||
        window.navigator.msMaxTouchPoints > 0;
}

function initRangeBar() {
    // get 2 values from data-start
    const minmax = rangeBar.dataset.start.split(",")
    if (!minmax || minmax.length < 2) return;

    // define start, end and two default points min and max
    let currentMin = parseInt(minmax[0])
    let currentMax = parseInt(minmax[1])
    let end = parseInt(rangeBar.dataset.max);
    let start = parseInt(rangeBar.dataset.min);

    if (typeof start !== 'number' &&
        typeof end !== 'number' &&
        typeof currentMin !== 'number' &&
        typeof currentMax !== 'number') {
        return;
    }

    if (end < start) {
        [start, end] = [end, start]
    }
    if (currentMin > currentMax) {
        [currentMax, currentMin] = [currentMin, currentMax]
    }
    if (currentMin < start) {
        currentMin = start;
    }
    if (currentMax > end || currentMax < currentMin) {
        currentMax = end;
    }

    // fill inputs default values min and max by data-start attr
    inputMinValue.value = currentMin
    inputMaxValue.value = currentMax

    // init range-bar
    return {
        max: end,
        min: start,
        currentMin: currentMin,
        currentMax: currentMax,
    }
}

function initPoints() {
    const rangeNumbers = range.max - range.min;
    const startPositionRangeMin = range.currentMin - range.min;
    const startPositionRangeMax = range.max - range.currentMax;
    const offsetMin = startPositionRangeMin / rangeNumbers * 100;
    const offsetMax = startPositionRangeMax / rangeNumbers * 100;

    minPoint.style.left = offsetMin + '%';
    minCover.style.width = offsetMin + '%'

    maxPoint.style.left = (100 - offsetMax) + '%';
    maxCover.style.width = offsetMax + '%'
}

initPoints()
// =========================================================================

// Events ==================================================================
const eventHoldDownName = isMobile ? "touchstart" : "mousedown";
minPoint.addEventListener(eventHoldDownName, holdDownHandler)
maxPoint.addEventListener(eventHoldDownName, holdDownHandler)
// =========================================================================

// Listener when hold down the key on points ===============================
function holdDownHandler(event) {
    const point = event.target
    point.ondragstart = () => false

    // fix target point for mouses!
    const onCursorMove = (event) => {
        movePoint(point, event)
    }

    const moveEventName = isMobile ? "touchmove" : "mousemove"
    const upEventName = isMobile ? "ontouchend" : "onmouseup"

    document.addEventListener(moveEventName, onCursorMove);
    document[upEventName] = () => {
        document.removeEventListener(moveEventName, onCursorMove);
        document[upEventName] = null
    }
}

const movePoint = (point, event) => {
    const startRangeX = upperLineRange.getBoundingClientRect().x;
    const widthRange = upperLineRange.clientWidth;
    const startNextPoint = maxPoint.getBoundingClientRect().x - startRangeX;
    const startPrevPoint = minPoint.getBoundingClientRect().x - startRangeX + minPoint.clientWidth;

    let pointPosition; // point position in 'px' relative to range-bar on the left side

    if (isMobile) {
        pointPosition = Math.trunc(event.touches[0].clientX - startRangeX)
    } else {
        pointPosition = Math.trunc(event.clientX - startRangeX)
    }

    if ((point === minPoint) && (pointPosition < 0 || pointPosition > widthRange || pointPosition > startNextPoint)) return;
    else if ((point === maxPoint) && (pointPosition < 0 || pointPosition > widthRange || pointPosition < startPrevPoint)) return;

    // point offset in '%' relative to range-bar on the left side
    let offset = Math.trunc(pointPosition / widthRange * 100);
    setPosition(offset, point)
}
const setPosition = (offset, point) => {
    if (offset > 100) return;
    const step = (range.max - range.min) / 100;
    const value = Math.trunc(range.min + step * offset)
    if (point === minPoint) {
        range.currentMin = value;
        inputMinValue.value = value
        minPoint.style.left = offset + '%';
        minCover.style.width = offset + '%'
    } else if (point === maxPoint) {
        range.currentMax = value;
        inputMaxValue.value = value
        maxPoint.style.left = offset + '%';
        maxCover.style.width = (100 - offset) + '%'
    }
}

// Value Inputs ============================================================
inputMinValue.addEventListener("change", changeMinValueHandler)
inputMaxValue.addEventListener("change", changeMaxValueHandler)

function changeMinValueHandler(event) {
    let value = parseInt(event.target.value)
    if (isNaN(value)) return;

    if (value < range.min) {
        value = range.min
        inputMinValue.value = value
    } else if (value > range.currentMax) {
        value = range.currentMax
        inputMinValue.value = value
    }
    range.currentMin = value
    initPoints()
}

function changeMaxValueHandler(event) {
    let value = parseInt(event.target.value)
    if (isNaN(value)) return;

    if (value > range.max) {
        value = range.max
        inputMaxValue.value = value
    }
    if (value < range.currentMin) {
        value = range.currentMin
        inputMaxValue.value = value
    }
    range.currentMax = value
    initPoints()
}

// =========================================================================