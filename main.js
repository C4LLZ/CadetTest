const sections = {};
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let selected = "";
const answerSummary = [];

fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    Object.assign(sections, data);
    renderSectionList();
  });

function renderSectionList() {
  const sectionList = document.getElementById('section-list');
  sectionList.innerHTML = '';
  for (const section in sections) {
    if (section === '10-Codes and Radio Signals - Hard') continue;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = section;
    checkbox.value = section;
    const label = document.createElement('label');
    label.htmlFor = section;
    label.textContent = section;
    label.prepend(checkbox);
    sectionList.appendChild(label);
  }
}

function selectAllSections() {
  document.querySelectorAll('.section-list input').forEach(cb => cb.checked = true);
}

function getSelectedMode() {
  const checked = document.querySelector('input[name="codeMode"]:checked');
  return checked ? checked.value : 'easy';
}

function startQuiz() {
  currentQuestions = [];
  answerSummary.length = 0;
  const mode = getSelectedMode();

  document.querySelectorAll('.section-list input:checked').forEach(cb => {
    currentQuestions.push(...sections[cb.value]);
  });

  if (mode === 'hard' && sections['10-Codes and Radio Signals - Hard']) {
    currentQuestions.push(...sections['10-Codes and Radio Signals - Hard']);
  }

  if (currentQuestions.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'No Sections Selected',
      text: 'Please select at least one section before starting the quiz.',
    });
    return;
  }

  currentQuestions.sort(() => Math.random() - 0.5);
  currentIndex = 0;
  score = 0;
  document.getElementById('section-select').style.display = 'none';
  document.getElementById('quiz').style.display = 'block';
  document.getElementById('quiz-controls').style.display = 'flex';
  showQuestion();
}

function showQuestion() {
  const q = currentQuestions[currentIndex];
  document.getElementById('progress').textContent = `Question ${currentIndex + 1} of ${currentQuestions.length}`;
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = `${(currentIndex / currentQuestions.length) * 100}%`;
  document.getElementById('question-text').textContent = q.question;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  selected = "";
  for (const key in q.options) {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'answer';
    radio.value = key;
    radio.onclick = () => selected = key;
    const badge = document.createElement('span');
    badge.className = 'option-key';
    badge.textContent = key;
    const text = document.createElement('span');
    text.className = 'option-text';
    text.textContent = q.options[key];
    label.append(radio, badge, text);
    optionsDiv.appendChild(label);
  }
  document.getElementById('feedback').textContent = '';
}

function submitAnswer() {
  if (!selected) {
    Swal.fire({
      icon: 'warning',
      title: 'No Answer Selected',
      text: 'You must choose an answer before submitting.',
    });
    return;
  }

  const q = currentQuestions[currentIndex];
  const isCorrect = selected === q.answer;
  if (isCorrect) score++;

  answerSummary.push({
    question: q.question,
    selected,
    correct: q.answer,
    explanation: q.explanation,
    wasCorrect: isCorrect
  });

  const isLast = currentIndex === currentQuestions.length - 1;

  Swal.fire({
    icon: isCorrect ? 'success' : 'error',
    title: isCorrect ? 'Correct!' : 'Incorrect!',
    html: q.explanation,
    confirmButtonText: isLast ? 'Finish Quiz' : 'Next Question',
    confirmButtonColor: '#ffb020',
    allowOutsideClick: false,
    allowEscapeKey: false,
  }).then(() => {
    if (isLast) {
      finishQuiz();
    } else {
      currentIndex++;
      showQuestion();
    }
  });
}

function finishQuiz() {
  const pct = Math.round((score / currentQuestions.length) * 100);
  let summaryHTML = `
    <div class="quiz-card summary-card">
      <p class="eyebrow">Debrief</p>
      <h2>Quiz Completed</h2>
      <p class="score-line">Your score: <strong>${score} / ${currentQuestions.length}</strong> (${pct}%)</p>
      <div class="summary-list">`;

  answerSummary.forEach((item, index) => {
    summaryHTML += `
        <div class="summary-item ${item.wasCorrect ? 'correct' : 'incorrect'}">
          <p class="summary-q"><span class="q-index">Q${index + 1}</span>${item.question}</p>
          <p class="summary-answer">Your answer: <strong>${item.selected}</strong> &mdash; ${item.wasCorrect ? 'Correct' : `Incorrect (correct: <strong>${item.correct}</strong>)`}</p>
          <p class="summary-explanation">${item.explanation}</p>
        </div>`;
  });

  summaryHTML += `
      </div>
      <div class="summary-actions">
        <button class="btn-exit" onclick="backToStart()">Back to Start</button>
      </div>
    </div>`;

  document.getElementById('quiz').innerHTML = summaryHTML;
  document.getElementById('quiz-controls').style.display = 'none';
}

function backToStart() {
  document.getElementById('section-select').style.display = 'block';
  document.getElementById('quiz').style.display = 'none';
  document.getElementById('quiz-controls').style.display = 'none';
  document.getElementById('quiz').innerHTML = `
    <div class="quiz-card">
      <div class="quiz-card-head">
        <span class="case-no" id="progress"></span>
        <div class="progress-track"><div class="progress-fill" id="progress-fill"></div></div>
      </div>
      <div class="question" id="question-text"></div>
      <div class="options" id="options"></div>
      <div class="feedback" id="feedback"></div>
    </div>
  `;
  document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
}

function exitQuiz() {
  Swal.fire({
    title: 'Exit Quiz?',
    text: "You’ll lose your progress if you exit now.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ffb020',
    cancelButtonColor: '#ff5c5c',
    confirmButtonText: 'Yes, exit',
  }).then((result) => {
    if (result.isConfirmed) {
      backToStart();
    }
  });
}