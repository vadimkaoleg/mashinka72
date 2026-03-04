document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const toggleBtn = document.getElementById('accessible-btn');

  // Создаём панель управления
  const panel = document.createElement('div');
  panel.id = 'accessibility-panel';
  panel.innerHTML = `
    <button id="increase-font">A+</button>
    <button id="decrease-font">A-</button>
    <button id="toggle-contrast">Контраст</button>
    <button id="toggle-images">Изображения</button>
    <button id="reset-accessibility">Сброс</button>
  `;
  document.body.appendChild(panel);

  // Состояния
  let fontSize = 20;
  let contrastOn = false;

  function applyFontSize() {
    body.style.fontSize = fontSize + 'px';
  }

  function applyContrast() {
    if (contrastOn) {
      body.style.backgroundColor = 'black';
      body.style.color = 'white';
    } else {
      body.style.backgroundColor = '';
      body.style.color = '';
    }
  }

  function enableAccessibility() {
    body.classList.add('accessible');
    panel.style.display = 'block';
    localStorage.setItem('accessible', 'true');
    applyFontSize();
    applyContrast();
  }

  function disableAccessibility() {
    body.classList.remove('accessible');
    body.classList.remove('no-images');
    panel.style.display = 'none';
    localStorage.setItem('accessible', 'false');
    fontSize = 20;
    contrastOn = false;
    body.style.fontSize = '';
    body.style.backgroundColor = '';
    body.style.color = '';
  }

  // Загрузка состояния
  if (localStorage.getItem('accessible') === 'true') {
    enableAccessibility();
  }

  // Кнопка включения версии
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (body.classList.contains('accessible')) {
        disableAccessibility();
      } else {
        enableAccessibility();
      }
    });
  }

  // Кнопки панели
  panel.querySelector('#increase-font').addEventListener('click', () => {
    fontSize += 2;
    applyFontSize();
  });

  panel.querySelector('#decrease-font').addEventListener('click', () => {
    fontSize = Math.max(12, fontSize - 2);
    applyFontSize();
  });

  panel.querySelector('#toggle-contrast').addEventListener('click', () => {
    contrastOn = !contrastOn;
    applyContrast();
  });

  panel.querySelector('#toggle-images').addEventListener('click', () => {
    body.classList.toggle('no-images');
  });

  panel.querySelector('#reset-accessibility').addEventListener('click', () => {
    disableAccessibility();
  });
});
