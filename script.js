let gameStarted = false;
let gameInterval = null;
let animationFrame = null;
let balls = [];
let missedBalls = 0;
const MAX_MISSED = 6;

/* التنقل بين الصفحات */
function nextPage(pageNumber) {
  const pages = document.querySelectorAll(".page");

  pages.forEach((page) => {
    page.classList.remove("active");
  });

  const targetPage = document.getElementById(`page${pageNumber}`);
  if (targetPage) {
    targetPage.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (pageNumber === 10) {
      setTimeout(startGame, 250);
    } else {
      stopGame();
    }
  }
}

/* =========================
   اللعبة
========================= */
function startGame() {
  if (gameStarted) return;

  const gameArea = document.getElementById("gameArea");
  const basket = document.getElementById("basket");
  const overlay = document.getElementById("gameOverlay");

  if (!gameArea || !basket || !overlay) return;

  gameStarted = true;
  balls = [];
  missedBalls = 0;
  overlay.classList.remove("show");

  // تنظيف أي كرات قديمة
  document.querySelectorAll(".ball").forEach((ball) => ball.remove());

  let basketX = gameArea.clientWidth / 2;
  const basketHalf = 30;

  function moveBasket(clientX) {
    const rect = gameArea.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(basketHalf, Math.min(gameArea.clientWidth - basketHalf, x));
    basketX = x;
    basket.style.left = `${basketX}px`;
  }

  // للموبايل
  gameArea.ontouchmove = (e) => {
    e.preventDefault();
    moveBasket(e.touches[0].clientX);
  };

  // للكمبيوتر
  gameArea.onmousemove = (e) => {
    moveBasket(e.clientX);
  };

  function createBall() {
    const ball = document.createElement("div");
    ball.className = "ball";
    ball.textContent = "🏐";

    const x = Math.random() * (gameArea.clientWidth - 40);
    ball.style.left = `${x}px`;
    gameArea.appendChild(ball);

    balls.push({
      el: ball,
      x: x,
      y: -40,
      speed: 3 + Math.random() * 1.5
    });
  }

  function updateGame() {
    if (!gameStarted) return;

    const basketRect = basket.getBoundingClientRect();
    const areaRect = gameArea.getBoundingClientRect();

    balls.forEach((ball, index) => {
      ball.y += ball.speed;
      ball.el.style.top = `${ball.y}px`;

      const ballRect = ball.el.getBoundingClientRect();

      // لو الكرة وصلت للسلة = نعتبرها برضه "ضاعت"
      const caught =
        ballRect.bottom >= basketRect.top &&
        ballRect.left < basketRect.right &&
        ballRect.right > basketRect.left;

      // لو نزلت تحت
      const missed = ball.y > gameArea.clientHeight - 20;

      if (caught || missed) {
        ball.el.remove();
        balls.splice(index, 1);
        missedBalls++;

        // عشان تخسر حتميًا
        if (missedBalls >= MAX_MISSED) {
          endGame();
        }
      }
    });

    animationFrame = requestAnimationFrame(updateGame);
  }

  function endGame() {
    stopGame();
    overlay.classList.add("show");
  }

  gameInterval = setInterval(createBall, 700);
  updateGame();
}

function stopGame() {
  gameStarted = false;

  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  document.querySelectorAll(".ball").forEach((ball) => ball.remove());

  const gameArea = document.getElementById("gameArea");
  if (gameArea) {
    gameArea.ontouchmove = null;
    gameArea.onmousemove = null;
  }
}
