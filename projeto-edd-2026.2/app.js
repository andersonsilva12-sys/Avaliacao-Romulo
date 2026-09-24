
class Square {
  constructor(value, size, startX, startY, targetX, targetY) {
    this.value = value;
    this.size = size;
    this.x = startX;
    this.y = startY;
    this.startX = startX;
    this.startY = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.progress = 0;       // 0 → 1 (andamento da animação)
    this.duration = 800;     // duração em ms
  }
 
  // Easing: começa rápido e desacelera no fim
  static easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
 
  get isAnimating() {
    return this.progress < 1;
  }

  moveTo(x, y) {
    this.startX = this.x;
    this.startY = this.y;
    this.targetX = x;
    this.targetY = y;
    this.progress = 0;
  }
 
  update(deltaTime) {
    if (!this.isAnimating) return;
 
    this.progress = Math.min(this.progress + deltaTime / this.duration, 1);    
    const t = Square.easeOutCubic(this.progress);
 
    this.x = this.startX + (this.targetX - this.startX) * t;
    this.y = this.startY + (this.targetY - this.startY) * t;
  }
 
  draw(ctx) {
    ctx.fillStyle = this.isAnimating ? "#93c5fd" : "#3b82f6";
    ctx.fillRect(this.x, this.y, this.size, this.size);
 
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.size, this.size);
 
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.value, this.x + this.size / 2, this.y + this.size / 2);
  }
}
 
class ArrayContainer {
  constructor(x, y, capacity, cellSize, padding) {
    this.x = x;
    this.y = y;
    this.capacity = capacity;
    this.cellSize = cellSize;
    this.padding = padding;
    this.items = [];
 
    this.width = capacity * (cellSize + padding) + padding;
    this.height = cellSize + padding * 2;
  }
 
  get isFull() {
    return this.items.length >= this.capacity;
  }
 
  // Posição (x, y) da célula de índice i
  slotPosition(index) {
    return {
      x: this.x + this.padding + index * (this.cellSize + this.padding),
      y: this.y + this.padding,
    };
  }
 
  add(value, startX, startY) {
    if (this.isFull) return null;
 
    const target = this.slotPosition(this.items.length);
    const square = new Square(value, this.cellSize, startX, startY, target.x, target.y);
    this.items.push(square);
    return square;
  }

  sort() {
    this.items.sort((first, second) => first.value - second.value);
    this.items.forEach((item, index) => {
      const target = this.slotPosition(index);
      item.moveTo(target.x, target.y);
    });
  }
 
  update(deltaTime) {
    this.items.forEach((item) => item.update(deltaTime));
  }
 
  draw(ctx) {
    // Retângulo externo
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
 
    // Células vazias + índices
    for (let i = 0; i < this.capacity; i++) {
      const { x, y } = this.slotPosition(i);
 
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#9ca3af";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, this.cellSize, this.cellSize);
      ctx.setLineDash([]);
 
      ctx.fillStyle = "#374151";
      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(`[${i}]`, x + this.cellSize / 2, this.y + this.height + 8);
    }
 
    // Quadrados
    this.items.forEach((item) => item.draw(ctx));
  }
}
 
class CanvasApp {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
 
    const capacity = 10;
    const cellSize = 60;
    const padding = 10;
    const width = capacity * (cellSize + padding) + padding;
 
    this.array = new ArrayContainer(
      (canvas.width - width) / 2,
      130,
      capacity,
      cellSize,
      padding
    );
 
    this.lastTime = 0;
    requestAnimationFrame((t) => this.loop(t));
  }
 
  // Ponto de partida do quadrado: topo central do canvas
  get spawnPoint() {
    return { x: this.canvas.width / 2 - this.array.cellSize / 2, y: 10 };
  }
 
  addValue(value) {
    const { x, y } = this.spawnPoint;
    return this.array.add(value, x, y);
  }
 
  loop(time) {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
 
    this.array.update(deltaTime);
    this.draw();
 
    requestAnimationFrame((t) => this.loop(t));
  }
 
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.array.draw(this.ctx);
  }
}
 
// =====================================================
// FormController: liga o formulário ao CanvasApp
// =====================================================
class FormController {
  constructor(form, input, message, app) {
    this.form = form;
    this.input = input;
    this.message = message;
    this.app = app;
 
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    this.form.addEventListener("click", (e) => {
      if (e.target.id === "botao-ordenar") this.handleSort();
    });
  }
 
  handleSubmit(event) {
    event.preventDefault();
 
    const value = Number(this.input.value);
    if (this.input.value === "" || Number.isNaN(value)) {
      this.showMessage("Informe um valor numérico.");
      return;
    }
 
    const square = this.app.addValue(value);
    if (!square) {
      this.showMessage("O array está cheio.");
      return;
    }
 
    this.showMessage(`Valor ${value} inserido no índice ${this.app.array.items.length - 1}.`);
    this.input.value = "";
    this.input.focus();
  }

  handleSort() {
    this.app.array.sort();
    this.showMessage("Elementos ordenados em ordem crescente.");
  }
 
  showMessage(text) {
    this.message.textContent = text;
  }
}
 
// =====================================================
// Inicialização
// =====================================================
const app = new CanvasApp(document.getElementById("canvas"));
 
new FormController(
  document.getElementById("form-valor"),
  document.getElementById("input-valor"),
  document.getElementById("mensagem"),
  app
);
 