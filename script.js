let currentPage = 1;

/* =========================
   التنقل بين الصفحات
========================= */
function nextPage(pageNumber) {
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => page.classList.remove("active"));

  const targetPage = document.getElementById(`page${pageNumber}`);
  if (targetPage) {
    targetPage.classList.add("active");
    currentPage = pageNumber;
    window.scrollTo({ top: 0, behavior: "smooth" });

    // لو دخل الصفحة 10 شغّل اللعبة
    if (pageNumber === 10) {
      setTimeout(() => {
        initGame();
      }, 300);
    } else {
      stopGame();
    }
  }
}

/* =========================
   اللعبة
========================= */
let gameInterval = null;
let moveInterval = null;
let gameRunning = false;
let missedCount = 0;
const MAX_MISSED = 6;

function initGame() {
  const gameArea = document.getElementById("gameArea");
  const basket = document.getElementById("basket");
  const overlay = document.getElementById("gameOverlay");

  if (!gameArea || !basket || !overlay) return;

  // لو اللعبة شغالة بالفعل، امنع إعادة تشغيلها
  stopGame();

  gameRunning = true;
  missedCount = 0;
  overlay.classList.remove("show");

  // امسح أي كرات قديمة
  gameArea.querySelectorAll(".ball").forEach(ball => ball.remove());

  // خلي السلة في النص أول ما الصفحة تفتح
  basket.style.left = "50%";
  basket.style.transform = "translateX(-50%)";

  /* =========================
     تحريك السلة
  ========================= */
  function moveBasket(clientX) {
    if (!gameRunning) return;

    const rect = gameArea.getBoundingClientRect();
    let x = clientX - rect.left;

    const basketWidth = 60;
    const minX = basketWidth / 2;
    const maxX = gameArea.clientWidth - basketWidth / 2;

    if (x < minX) x = minX;
    if (x > maxX) x = maxX;

    basket.style.left = `${x}px`;
    basket.style.transform = "translateX(-50%)";
  }

  // موبايل
  gameArea.ontouchmove = function (e) {
    e.preventDefault();
    moveBasket(e.touches[0].clientX);
  };

  // كمبيوتر
  gameArea.onmousemove = function (e) {
    moveBasket(e.clientX);
  };

  /* =========================
     إنشاء الكور
  ========================= */
  gameInterval = setInterval(() => {
    if (!gameRunning) return;

    const ball = document.createElement("div");
    ball.className = "ball";
    ball.textContent = "🏐";

    const x = Math.random() * (gameArea.clientWidth - 50);
    ball.style.left = `${x}px`;
    ball.style.top = `-40px`;

    gameArea.appendChild(ball);

    let y = -40;
    const speed = 4 + Math.random() * 2;

    const oneBall = setInterval(() => {
      if (!gameRunning) {
        clearInterval(oneBall);
        if (ball.parentNode) ball.remove();
        return;
      }

      y += speed;
      ball.style.top = `${y}px`;

      const ballRect = ball.getBoundingClientRect();
      const basketRect = basket.getBoundingClientRect();

      const caught =
        ballRect.bottom >= basketRect.top &&
        ballRect.top <= basketRect.bottom &&
        ballRect.right >= basketRect.left &&
        ballRect.left <= basketRect.right;

      const fell = y > gameArea.clientHeight;

      // سواء اتلمت أو وقعت = تتحسب ضدها عشان تخسر في الآخر 😭
      if (caught || fell) {
        clearInterval(oneBall);
        if (ball.parentNode) ball.remove();

        missedCount++;

        if (missedCount >= MAX_MISSED) {
          endGame();
        }
      }
    }, 20);
  }, 700);
}

function endGame() {
  const overlay = document.getElementById("gameOverlay");
  stopGame();
  if (overlay) overlay.classList.add("show");
}

function stopGame() {
  gameRunning = false;

  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }

  const gameArea = document.getElementById("gameArea");
  if (gameArea) {
    gameArea.querySelectorAll(".ball").forEach(ball => ball.remove());
    gameArea.ontouchmove = null;
    gameArea.onmousemove = null;
  }
                             }
