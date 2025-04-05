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
  document.getElementById('question-text').textContent = q.question;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  selected = "";
  for (const key in q.options) {
    const label = document.createElement('label');
    label.textContent = `${key}: ${q.options[key]}`;
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'answer';
    radio.value = key;
    radio.onclick = () => selected = key;
    label.prepend(radio);
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
  let summaryHTML = `<h2>Quiz Completed</h2><p>Your score: ${score} / ${currentQuestions.length}</p><hr>`;
  answerSummary.forEach((item, index) => {
    summaryHTML += `<div style="margin-bottom: 12px;">
      <strong>Q${index + 1}:</strong> ${item.question}<br>
      <span style="color: ${item.wasCorrect ? '#3ba55c' : '#d33'}">Your Answer: ${item.selected} (${item.wasCorrect ? 'Correct' : 'Incorrect'})</span><br>
      <span>Correct Answer: ${item.correct}</span><br>
      <em>${item.explanation}</em>
    </div><hr>`;
  });

  summaryHTML += `<div style="text-align: center; margin-top: 20px;"><button class="btn-exit" onclick="exitQuiz()">Back to Start</button></div>`;

  document.getElementById('quiz').innerHTML = summaryHTML;
  document.getElementById('quiz-controls').style.display = 'none';
}

function exitQuiz() {
  Swal.fire({
    title: 'Exit Quiz?',
    text: "You’ll lose your progress if you exit now.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3ba55c',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, exit',
  }).then((result) => {
    if (result.isConfirmed) {
      document.getElementById('section-select').style.display = 'block';
      document.getElementById('quiz').style.display = 'none';
      document.getElementById('quiz-controls').style.display = 'none';
      document.getElementById('quiz').innerHTML = `
        <h3 id="progress"></h3>
        <div class="question" id="question-text"></div>
        <div class="options" id="options"></div>
        <div class="feedback" id="feedback"></div>
      `;
      document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
    }
  });
}