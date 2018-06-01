let intervalTimer;
let timerActive = false;
let ticks = 0;

const SECONDS_PER_MINUTE = 60;
const MS_PER_TICK = 10;
const MS_PER_SECOND = 1000;
const TICKS_PER_SECOND = (MS_PER_SECOND / MS_PER_TICK);

const states = ['session', 'break'];
let currentState = 0;

var secondsToHMS = (totalSeconds) => {
    var hours   = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
    var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {
        hours   = "0" + hours;
    }
    
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    
    return hours+':'+minutes+':'+seconds;    
};

var getTimerLen = (idPrefix) => {
    let id = idPrefix + '-length';
    let e = window[id];
    let n = parseInt(e.innerText);

    return n * SECONDS_PER_MINUTE;
};

// Time left is a floating point value of seconds.milliseconds
// that corresponds to how much time is left on the clock
var updateProgressBar = (timeLeft) => {
    let timerStartingValue = getTimerLen(states[currentState]);
    let diff = timerStartingValue - timeLeft;
    let perc = (diff / timerStartingValue) * 100; 
    let progressBar = document.querySelector('div#progress-bar > div.progress');    

    perc = parseFloat(perc.toFixed(2));

    if (perc > 100)
        perc = 100;

    progressBar.style.width = perc + '%';
};

var updateTimerDisplay = (timeInSeconds) => {
    timer.dataset.seconds = timeInSeconds;
    timer.innerText = secondsToHMS(timeInSeconds)
};

var tick = () => {
    if (timerActive) {
        let timeLeft = parseInt(timer.dataset.seconds);

        if ((++ticks % TICKS_PER_SECOND) !== 0) {
            let msElapsed = ticks * MS_PER_TICK;
            timeLeft -= (msElapsed / MS_PER_SECOND);
            updateProgressBar(timeLeft);
        } else {
            // One second has passed - Reset ticks
            ticks = 0;
            
            if (timeLeft === 0) {
                // Timer finished
                currentState = currentState ^ 1;
                timeLeft = getTimerLen(states[currentState]);

                // Toggle the active panel
                document.querySelector('.session-panel').classList.toggle('active');
                document.querySelector('.break-panel').classList.toggle('active');
            } else {
                timeLeft--;
            }

            updateTimerDisplay(timeLeft);
            updateProgressBar(timeLeft);
        }
    }
};

var startTimer = () => {
    intervalTimer = setInterval(tick, MS_PER_TICK);
};

document.querySelector('#timer').onclick = (event) => {
    if (event.target.id === 'timer') {
        timerActive = timerActive ? false : true;
        if (timerActive) {
            startTimer();
        } else {
            clearInterval(intervalTimer);
        }
    }
};

// Update the Session/Break timer lengths
var updateTimerLen = (elem, op) => {
    let n;

    if (op === '+') {
        n = parseInt(elem.innerText) + 1;
    } else {
        n = parseInt(elem.innerText) - 1;
    }

    if (n <= 0 || n > 99) {
        return;
    }

    elem.innerText = n;
        
    // The timer only gets updated if the controls pressed
    // match the current state. Eg, the current state is
    // Session and the +/- for session got pressed.
    if (elem.dataset.state === states[currentState]) {
        updateTimerDisplay(n * SECONDS_PER_MINUTE);
    }
};

document.querySelector('.wrapper').onclick = (event) => {
    if (event.target.innerText === '+' ||
        event.target.innerText === '-') {
        let op = event.target.innerText;        
        let elem = window[event.target.dataset.state+'-length'];

        if (!timerActive) {
            updateTimerLen(elem, op);
        }
    }
};

document.querySelector('.wrapper').onload = () => {
    let minutes = parseInt(window['session-length'].innerText);
    let seconds = minutes * SECONDS_PER_MINUTE;

    updateTimerDisplay(seconds);
};
