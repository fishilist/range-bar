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

if (isMobile) {
    minPoint.addEventListener("touchstart", touchDownHandler)
    maxPoint.addEventListener("touchstart", touchDownHandler)
} else {
    minPoint.addEventListener("mousedown", mouseDownHandler)
    maxPoint.addEventListener("mousedown", mouseDownHandler)
}

initPoints()
inputMinValue.addEventListener("change", changeMinValueHandler)
inputMaxValue.addEventListener("change", changeMaxValueHandler)


function touchDownHandler(event) {
    if (event.target === minPoint) {
        document.addEventListener('touchmove', onMouseMove);
    } else {
        document.addEventListener('touchmove', onMouseMoveMax);
    }

    document.ontouchend = () => {
        document.removeEventListener('touchmove', onMouseMove)
        document.removeEventListener('touchmove', onMouseMoveMax)
        document.ontouchend = null
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

function mouseDownHandler(event) {
    if (event.target === minPoint) {
        //touchmove
        document.addEventListener('mousemove', onMouseMove);
        //document.addEventListener('touchmove', onMouseMove);
    } else {
        document.addEventListener('mousemove', onMouseMoveMax);
        //document.addEventListener('touchmove', onMouseMoveMax);
    }

    // document.ontouchend = function onTouchUp() {
    //     document.removeEventListener('touchmove', onMouseMove)
    //     document.removeEventListener('touchmove', onMouseMoveMax)
    //     document.ontouchend = null
    //     document.removeEventListener('mousemove', onMouseMove)
    //     document.removeEventListener('mousemove', onMouseMoveMax)
    //     document.onmouseup = null
    // }
    document.onmouseup = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mousemove', onMouseMoveMax)
        document.onmouseup = null
    }
}

const onMouseMove = (event) => {
    const startUnderlineX = upperLineRange.getBoundingClientRect().x;
    const widthUnderLine = upperLineRange.clientWidth;
    const startMaxPoint = maxPoint.getBoundingClientRect().x - startUnderlineX;

    let offsetPx = Math.trunc(event.clientX - startUnderlineX); // px
    if (offsetPx === undefined || isNaN(offsetPx)) {
        offsetPx = Math.trunc(event.touches[0].clientX - startUnderlineX); // px
    }
    if (offsetPx <= 0 || offsetPx > widthUnderLine || offsetPx >= startMaxPoint) return;

    let offset = Math.trunc(offsetPx / widthUnderLine * 100); // NaN
    let step = (range.max - range.min) / 100;
    const value = Math.trunc(range.min + step * offset)
    range.currentMin = value;
    inputMinValue.value = value

    minPoint.style.left = offset + '%';
    minCover.style.right = (100 - offset) + '%'
    minCover.style.width = offset + '%'
}

const onMouseMoveMax = (event) => {
    const startUnderlineX = upperLineRange.getBoundingClientRect().x;
    const widthUnderLine = upperLineRange.clientWidth;
    const startMinPoint = minPoint.getBoundingClientRect().x - startUnderlineX + minPoint.clientWidth;

    let offsetPx = Math.trunc(event.clientX - startUnderlineX); // px
    if (offsetPx === undefined || isNaN(offsetPx)) {
        offsetPx = Math.trunc(event.touches[0].clientX - startUnderlineX); // px
    }
    if (offsetPx <= 0 || offsetPx > widthUnderLine || offsetPx <= startMinPoint) return;
    const offset = Math.trunc(offsetPx / widthUnderLine * 100);

    let step = (range.max - range.min) / 100;
    const value = Math.trunc(range.min + step * offset)
    inputMaxValue.value = value
    range.currentMax = value;

    maxPoint.style.left = offset + '%';
    maxCover.style.width = (100 - offset) + '%'
}

function changeMinValueHandler(event) {
    let value = Number(event.target.value)
    if (value < range.min) {
        value = range.min
        inputMinValue.value = value
    }
    if (value > range.currentMax) {
        value = range.currentMax
        inputMinValue.value = value
    }
    range.currentMin = value
    initPoints()
}

function changeMaxValueHandler(event) {
    let value = Number(event.target.value)
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