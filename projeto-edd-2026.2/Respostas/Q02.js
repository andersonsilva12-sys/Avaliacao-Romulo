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
 
  update(deltaTime) {
    this.items.forEach((item) => item.update(deltaTime));
  }
 
  draw(ctx) {
    // Retângulo externo
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
 
    // Células utilizadas + índices
    for (const [i, item] of this.items.entries()) {
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

      item.draw(ctx);
    }
  }
}