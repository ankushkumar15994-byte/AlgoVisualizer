// ===== Home Page — animated hero background =====

(function () {
  const canvas = document.getElementById('heroBg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, nodes, animId;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function initNodes(count = 40) {
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 3 + 2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const isLight = document.body.classList.contains('light');
    const nodeColor = isLight ? 'rgba(108,99,255,0.5)' : 'rgba(108,99,255,0.7)';
    const lineColor = isLight ? 'rgba(108,99,255,0.12)' : 'rgba(108,99,255,0.18)';

    // Edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 1 - dist / 140;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    // Nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.fill();
    });
  }

  function update() {
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });
  }

  function loop() {
    update();
    draw();
    animId = requestAnimationFrame(loop);
  }

  resize();
  initNodes();
  loop();

  window.addEventListener('resize', () => {
    resize();
    initNodes();
  });
})();
