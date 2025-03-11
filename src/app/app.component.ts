import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'myrpg';
  ctx: any;
  canvas: any;
  TILE_SIZE = 32;
  MAP_WIDTH = 30; // ⬆ AUMENTA O MAPA
  MAP_HEIGHT = 30;
  player = {
    x: 15, // Posição inicial centralizada
    y: 15,
    color: "blue",
    health: 10,
    maxHealth: 10,
    gold: 0 // 🏆 Nova variável para armazenar recompensas
  };
  monsters = this.generateMonsters(10); // 🦇 Gera 15 monstros aleatórios pelo mapa
  selectedMonster: any = null;
  turn = 0;

  ngAfterViewInit() {
    this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = this.TILE_SIZE * this.MAP_WIDTH;
    this.canvas.height = this.TILE_SIZE * this.MAP_HEIGHT;

    document.addEventListener("keydown", (event) => {
      console.log(event)
      switch (event.key) {
        case "ArrowUp":
        case "w":
          this.movePlayer(0, -1);
          break;
        case "ArrowDown":
        case "s":
          this.movePlayer(0, 1);
          break;
        case "ArrowLeft":
        case "a":
          this.movePlayer(-1, 0);
          break;
        case "ArrowRight":
        case "d":
          this.movePlayer(1, 0);
          break;
        case " ":
          this.attack()
          break;
      }
    });

    this.canvas.addEventListener("click", (event: any) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / this.TILE_SIZE);
      const y = Math.floor((event.clientY - rect.top) / this.TILE_SIZE);

      this.selectedMonster = this.monsters.find(m => m.x === x && m.y === y) || null;
      this.update();
    });

    this.update();
  }

  generateMonsters(count: number) {
    let monsters = [];
    for (let i = 0; i < count; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * this.MAP_WIDTH);
        y = Math.floor(Math.random() * this.MAP_HEIGHT);
      } while ((x === this.player.x && y === this.player.y) || this.isOccupied(x, y));

      monsters.push({ x, y, color: "red", health: 5, maxHealth: 5, damage: 1, reward: 2 });
    }
    return monsters;
  }

  drawGrid() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.MAP_WIDTH; i++) {
      for (let j = 0; j < this.MAP_HEIGHT; j++) {
        this.ctx.strokeStyle = "black";
        this.ctx.strokeRect(i * this.TILE_SIZE, j * this.TILE_SIZE, this.TILE_SIZE, this.TILE_SIZE);
      }
    }
  }

  drawPlayer() {
    this.ctx.fillStyle = this.player.color;
    this.ctx.fillRect(this.player.x * this.TILE_SIZE, this.player.y * this.TILE_SIZE, this.TILE_SIZE, this.TILE_SIZE);
  }

  drawMonsters() {
    for (let monster of this.monsters) {
      this.ctx.fillStyle = monster === this.selectedMonster ? "yellow" : monster.color;
      this.ctx.fillRect(monster.x * this.TILE_SIZE, monster.y * this.TILE_SIZE, this.TILE_SIZE, this.TILE_SIZE);
    }
  }

  drawHealthBar(x: number, y: number, health: number, maxHealth: number) {
    const healthRatio = health / maxHealth;
    const barWidth = this.TILE_SIZE * healthRatio;

    this.ctx.fillStyle = "red";
    this.ctx.fillRect(x * this.TILE_SIZE, (y * this.TILE_SIZE) - 5, this.TILE_SIZE, 4);

    this.ctx.fillStyle = "green";
    this.ctx.fillRect(x * this.TILE_SIZE, (y * this.TILE_SIZE) - 5, barWidth, 4);
  }

  update() {
    this.drawGrid();
    this.drawPlayer();
    this.drawMonsters();
    this.drawHealthBar(this.player.x, this.player.y, this.player.health, this.player.maxHealth);

    for (let monster of this.monsters) {
      this.drawHealthBar(monster.x, monster.y, monster.health, monster.maxHealth);
    }
  }

  movePlayer(dx: number, dy: number) {
    let newX = this.player.x + dx;
    let newY = this.player.y + dy;

    const objetoNaPosicao = this.isOccupied(newX, newY)
    if (objetoNaPosicao) {
      this.selectedMonster = objetoNaPosicao
    }

    if (!this.isWithinBounds(newX, newY) || objetoNaPosicao) {

    } else {
      this.player.x = newX;
      this.player.y = newY;
    }
    this.autoAttack();
    this.turn++;
    this.monsterTurn();
    this.update();
  }

  isOccupied(x: number, y: number) {
    return this.monsters?.find(m => m.x === x && m.y === y);
  }

  autoAttack() {
    let targets = this.monsters.filter(m => Math.abs(m.x - this.player.x) + Math.abs(m.y - this.player.y) === 1);
    if (targets.length > 0) {
      let target = this.selectedMonster && targets.includes(this.selectedMonster) ? this.selectedMonster : targets[0];
      this.attackMonster(target);
    }
  }

  attack() {
    let target = this.selectedMonster || this.monsters.find(m => Math.abs(m.x - this.player.x) + Math.abs(m.y - this.player.y) === 1);

    if (target) {
      this.attackMonster(target);
    }

    this.turn++;
    this.monsterTurn();
    this.update();
  }

  monsterTurn() {
    for (let monster of this.monsters) {
      let dx = this.player.x - monster.x;
      let dy = this.player.y - monster.y;

      // Se o monstro estiver ao lado do jogador, ele ataca
      if (Math.abs(dx) + Math.abs(dy) === 1) {
        this.player.health -= monster.damage;
        if (this.player.health <= 0) {
          location.reload();
        }
      } else {
        // Lista de movimentos possíveis (cima, baixo, esquerda, direita)
        let possibleMoves = [
          { x: monster.x + 1, y: monster.y }, // Direita
          { x: monster.x - 1, y: monster.y }, // Esquerda
          { x: monster.x, y: monster.y + 1 }, // Baixo
          { x: monster.x, y: monster.y - 1 }  // Cima
        ].filter(pos => this.isWithinBounds(pos.x, pos.y) && !this.isOccupied(pos.x, pos.y)); // Filtra posições válidas

        // Determina a melhor direção movendo-se na menor distância até o jogador
        let bestMove = possibleMoves.reduce((best, move) => {
          let currentDistance = Math.abs(this.player.x - monster.x) + Math.abs(this.player.y - monster.y);
          let newDistance = Math.abs(this.player.x - move.x) + Math.abs(this.player.y - move.y);
          return newDistance < currentDistance ? move : best;
        }, { x: monster.x, y: monster.y }); // Valor padrão é a posição atual, caso não haja opções válidas

        // Move o monstro para a melhor posição
        monster.x = bestMove.x;
        monster.y = bestMove.y;
      }
    }
  }

  attackMonster(target: any) {
    target.health -= 2;
    if (target.health <= 0) {
      this.player.health = Math.min(this.player.health + 2, this.player.maxHealth); // 💚 Recupera vida ao matar
      this.player.gold += target.reward; // 🏆 Ganha ouro
      this.monsters = this.monsters.filter(m => m !== target);
      if (this.selectedMonster === target) {
        this.selectedMonster = null;
      }
    }
  }

  isWithinBounds(x: number, y: number) {
    return x >= 0 && x < this.MAP_WIDTH && y >= 0 && y < this.MAP_HEIGHT;
  }
}
