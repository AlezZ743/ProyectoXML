let questions = [];
let currentIndex = 0;
let score = 0;
let seconds = 0;
let timerInterval;
let lang = 'es';

const texts = {
    es: { next: "Siguiente", score: "Puntuación", time: "Tiempo", finish: "Finalizar" },
    en: { next: "Next", score: "Score", time: "Time", finish: "Finish" }
};

async function startQuiz(fileName) {
    // 1. Detectar idioma
    const langSelect = document.getElementById('lang');
    lang = langSelect ? langSelect.value : 'es';
    
    // 2. Construir ruta dinámica: xml/es/archivo.xml o xml/en/archivo.xml
    const filePath = `xml/${lang}/${fileName}`;
    
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error("Archivo no encontrado");
        
        const text = await response.text();
        const xml = new DOMParser().parseFromString(text, "text/xml");
        
        questions = Array.from(xml.getElementsByTagName('question'));
        currentIndex = 0;
        score = 0;
        seconds = 0;
        
        // Interfaz
        document.getElementById('setup').classList.add('hidden');
        document.getElementById('quiz-container').classList.remove('hidden');
        
        resetTimer();
        startTimer();
        showQuestion();
    } catch (error) {
        console.error("Error:", error);
        alert(lang === 'es' ? "Error al cargar las preguntas" : "Error loading questions");
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        let m = Math.floor(seconds / 60).toString().padStart(2, '0');
        let s = (seconds % 60).toString().padStart(2, '0');
        document.getElementById('timer').innerText = `${m}:${s}`;
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    document.getElementById('timer').innerText = "00:00";
}

function updateProgressBar() {
    const progress = ((currentIndex) / questions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function showQuestion() {
    updateProgressBar();
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

function checkAnswer(selectedBtn, isCorrect) {
    const allBtns = document.querySelectorAll('.choice-btn');
    
    if (isCorrect) {
        score++;
        selectedBtn.classList.add('correct');
    } else {
        selectedBtn.classList.add('incorrect');
        // Mostrar cuál era la correcta
        allBtns.forEach(btn => {
        });
    }
    
    allBtns.forEach(b => b.disabled = true);
    
    const nextBtn = document.getElementById('next-btn');
    nextBtn.classList.remove('hidden');
    nextBtn.innerText = (currentIndex === questions.length - 1) ? texts[lang].finish : texts[lang].next;
    
    document.getElementById('score-display').innerText = `${texts[lang].score}: ${score}`;
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
    document.getElementById('progress-bar').style.width = `100%`;
    document.getElementById('question-box').innerHTML = `<h2>Test Completado</h2>`;
    document.getElementById('choices-box').innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <p style="font-size: 1.2rem;">${texts[lang].score}: <strong>${score} / ${questions.length}</strong></p>
            <p>${texts[lang].time}: <strong>${document.getElementById('timer').innerText}</strong></p>
            <button class="btn-primary" onclick="location.reload()" style="margin-top:20px;">Reiniciar</button>
        </div>
    `;
    document.getElementById('next-btn').classList.add('hidden');
}