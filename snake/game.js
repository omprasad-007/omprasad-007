(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const speedInput = document.getElementById('speed');
  const speedValue = document.getElementById('speedValue');
  const scoreEl = document.getElementById('score');
  const pauseBtn = document.getElementById('pause');
  const restartBtn = document.getElementById('restart');
  const toggleWallsBtn = document.getElementById('toggleWalls');

  let tileSize = 20; // pixels
  let gridW = 30; let gridH = 20; // will be recalculated
  let snake = [{x:8,y:10},{x:7,y:10},{x:6,y:10}];
  let dir = {x:1,y:0};
  let nextDir = dir;
  let apple = {x:15,y:10};
  let score = 0;
  let wallsOn = true;

  let lastTime = 0;
  let accumulator = 0;
  let running = true;

  function resizeCanvas(){
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);
    gridW = Math.floor(canvas.width / tileSize);
    gridH = Math.floor(canvas.height / tileSize);
    if (gridW < 8) gridW = 8;
    if (gridH < 6) gridH = 6;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function placeApple(){
    let pos;
    do{
      pos = {x: Math.floor(Math.random()*gridW), y: Math.floor(Math.random()*gridH)};
    }while(snake.some(s=>s.x===pos.x && s.y===pos.y));
    apple = pos;
  }

  function setSpeed(v){
    speedValue.textContent = v;
  }
  setSpeed(speedInput.value);

  speedInput.addEventListener('input', (e)=> setSpeed(e.target.value));

  function step(){
    dir = nextDir;
    const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
    if (wallsOn){
      if (head.x < 0 || head.x >= gridW || head.y < 0 || head.y >= gridH){
        gameOver(); return;
      }
    } else {
      head.x = (head.x + gridW) % gridW;
      head.y = (head.y + gridH) % gridH;
    }

    if (snake.some(s => s.x===head.x && s.y===head.y)) { gameOver(); return; }

    snake.unshift(head);
    if (head.x===apple.x && head.y===apple.y){
      score += 1; scoreEl.textContent = 'Score: ' + score; placeApple();
    } else {
      snake.pop();
    }
  }

  function gameOver(){
    running = false;
    pauseBtn.textContent = 'Game Over';
    pauseBtn.disabled = true;
  }

  function restart(){
    snake = [{x:8,y:10},{x:7,y:10},{x:6,y:10}];
    dir = {x:1,y:0}; nextDir = dir; score = 0; scoreEl.textContent='Score: 0';
    running = true; pauseBtn.textContent='Pause'; pauseBtn.disabled = false; placeApple();
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // background grid
    ctx.fillStyle = '#071029';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // apple
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(apple.x*tileSize+2, apple.y*tileSize+2, tileSize-4, tileSize-4);

    // snake
    for (let i=0;i<snake.length;i++){
      const s = snake[i];
      ctx.fillStyle = i===0 ? '#58a6ff' : '#1f6feb';
      ctx.fillRect(s.x*tileSize+1, s.y*tileSize+1, tileSize-2, tileSize-2);
    }
  }

  function loop(time){
    if (!lastTime) lastTime = time;
    const delta = (time - lastTime)/1000; lastTime = time;
    const speed = parseInt(speedInput.value,10);
    accumulator += delta;
    const interval = 1 / speed;
    while(accumulator >= interval){
      if (running) step();
      accumulator -= interval;
    }
    draw();
    requestAnimationFrame(loop);
  }

  // Controls
  window.addEventListener('keydown', (e)=>{
    if (e.key === ' '){ e.preventDefault(); togglePause(); return; }
    if (e.key.toLowerCase() === 'r'){ restart(); return; }
    const k = e.key;
    const map = {
      ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0],
      w:[0,-1], s:[0,1], a:[-1,0], d:[1,0]
    };
    const v = map[k];
    if (v){
      const nd = {x:v[0], y:v[1]};
      if (nd.x === -dir.x && nd.y === -dir.y) return; // ignore reverse
      nextDir = nd;
    }
  });

  // Touch swipe
  let touchStart = null;
  canvas.addEventListener('touchstart', (e)=>{ touchStart = e.touches[0]; });
  canvas.addEventListener('touchmove', (e)=> e.preventDefault(), {passive:false});
  canvas.addEventListener('touchend', (e)=>{
    if (!touchStart) return; const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.clientX; const dy = t.clientY - touchStart.clientY;
    if (Math.abs(dx) > Math.abs(dy)){
      if (dx > 20) nextDir = {x:1,y:0}; else if (dx < -20) nextDir = {x:-1,y:0};
    } else {
      if (dy > 20) nextDir = {x:0,y:1}; else if (dy < -20) nextDir = {x:0,y:-1};
    }
    touchStart = null;
  });

  function togglePause(){ running = !running; pauseBtn.textContent = running ? 'Pause' : 'Resume'; }
  pauseBtn.addEventListener('click', togglePause);
  restartBtn.addEventListener('click', restart);
  toggleWallsBtn.addEventListener('click', ()=>{ wallsOn = !wallsOn; toggleWallsBtn.textContent = 'Walls: ' + (wallsOn ? 'On' : 'Off'); });

  // initial
  placeApple();
  requestAnimationFrame(loop);
  // handle first resize in case
  setTimeout(resizeCanvas, 50);
})();
