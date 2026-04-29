let questions = [];
let currentIndex = 0;
let score = 0;
let seconds = 0;
let timerInterval;
let lang = 'es';

const texts = {
    es: { next: "Siguiente", score: "Puntuación", time: "Tiempo" },
    en: { next: "Next", score: "Score", time: "Time" }
};

async function startQuiz(file) {
    lang = document.getElementById('lang').value;
    const response = await fetch(file);
    const text = await response.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");
    
    questions = Array.from(xml.getElementsByTagName('question'));
    currentIndex = 0;
    score = 0;
    seconds = 0;
    
    document.getElementById('setup').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    
    startTimer();
    showQuestion();
}

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        let m = Math.floor(seconds / 60).toString().padStart(2, '0');
        let s = (seconds % 60).toString().padStart(2, '0');
        document.getElementById('timer').innerText = `${m}:${s}`;
    }, 1000);
}

function showQuestion() {
    const q = questions[currentIndex];
    const wording = q.getElementsByTagName('wording')[0].textContent;
    const choices = Array.from(q.getElementsByTagName('choice'));
    
    document.getElementById('question-box').innerHTML = `<h3>${wording}</h3>`;
    const choicesBox = document.getElementById('choices-box');
    choicesBox.innerHTML = '';
    
    choices.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = c.textContent;
        btn.onclick = () => checkAnswer(btn, c.getAttribute('correct') === 'yes');
        choicesBox.appendChild(btn);
    });
    document.getElementById('next-btn').classList.add('hidden');
}

function checkAnswer(btn, isCorrect) {
    if (isCorrect) {
        score++;
        btn.classList.add('correct');
    } else {
        btn.classList.add('incorrect');
    }
    
    // Deshabilitar botones
    Array.from(document.getElementsByClassName('choice-btn')).forEach(b => b.disabled = true);
    document.getElementById('next-btn').classList.remove('hidden');
    document.getElementById('next-btn').innerText = texts[lang].next;
}

function nextQuestion() {
    currentIndex++;
    if (currentIndex < questions.length) {
        showQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    clearInterval(timerInterval);
    document.getElementById('question-box').innerHTML = `<h2>Fin</h2>`;
    document.getElementById('choices-box').innerHTML = `
        <p>${texts[lang].score}: ${score} / ${questions.length}</p>
        <p>${texts[lang].time}: ${document.getElementById('timer').innerText}</p>
    `;
    document.getElementById('next-btn').classList.add('hidden');
}