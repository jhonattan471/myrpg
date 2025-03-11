import { AfterViewInit, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  title = 'myrpg';

  main() {
    const canvas = document.getElementById("gameCanvas") as any;
    const ctx = canvas.getContext("2d");

    const TILE_SIZE = 32;
    const MAP_WIDTH = 10;
    const MAP_HEIGHT = 10;

    canvas.width = TILE_SIZE * MAP_WIDTH;
    canvas.height = TILE_SIZE * MAP_HEIGHT;

    let player = {
      x: 5,
      y: 5,
      color: "blue",
      health: 10
    };

    let monsters = [
      { x: 3, y: 3, color: "red", health: 5, damage: 1 },
      { x: 7, y: 6, color: "red", health: 5, damage: 1 }
    ];

    let selectedMonster: any = null;

    function drawGrid() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < MAP_WIDTH; i++) {
        for (let j = 0; j < MAP_HEIGHT; j++) {
          ctx.strokeStyle = "black";
          ctx.strokeRect(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    function drawPlayer() {
      ctx.fillStyle = player.color;
      ctx.fillRect(player.x * TILE_SIZE, player.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

      // Barra de vida do jogador
      ctx.fillStyle = "green";
      let healthBarWidth = (player.health / 10) * TILE_SIZE;
      ctx.fillRect(player.x * TILE_SIZE, player.y * TILE_SIZE - 5, healthBarWidth, 4);
    }

    function drawMonsters() {
      for (let monster of monsters) {
        ctx.fillStyle = monster === selectedMonster ? "yellow" : monster.color;
        ctx.fillRect(monster.x * TILE_SIZE, monster.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // Barra de vida do monstro
        ctx.fillStyle = "green";
        let healthBarWidth = (monster.health / 5) * TILE_SIZE;
        ctx.fillRect(monster.x * TILE_SIZE, monster.y * TILE_SIZE - 5, healthBarWidth, 4);
      }
    }

    function update() {
      drawGrid();
      drawPlayer();
      drawMonsters();

      (document.getElementById("playerHealth") as any).innerText = player.health;
      (document.getElementById("selectedEnemy") as any).innerText = selectedMonster ? `(${selectedMonster.x}, ${selectedMonster.y})` : "Nenhum";
    }

    function movePlayer(dx: number, dy: number) {
      let newX = player.x + dx;
      let newY = player.y + dy;

      if (newX >= 0 && newX < MAP_WIDTH && newY >= 0 && newY < MAP_HEIGHT) {
        let monster = monsters.find(m => m.x === newX && m.y === newY);

        if (monster) {
          // Seleciona o monstro para ataque
          selectedMonster = monster;
        } else {
          // Move o jogador se não houver monstro
          player.x = newX;
          player.y = newY;
        }

        update();
      }
    }

    function attack() {
      if (selectedMonster) {
        selectedMonster.health -= 2;

        if (selectedMonster.health <= 0) {
          monsters = monsters.filter(m => m !== selectedMonster);
          selectedMonster = null;
        }

        // O monstro contra-ataca se ainda estiver vivo
        if (selectedMonster) {
          player.health -= selectedMonster.damage;
        }

        // Verifica se o jogador morreu
        if (player.health <= 0) {
          alert("Você morreu! Game Over.");
          location.reload();
        }

        update();
      }
    }

    function monsterAI() {
      for (let monster of monsters) {
        let dx = player.x - monster.x;
        let dy = player.y - monster.y;

        if (Math.abs(dx) + Math.abs(dy) === 1) {
          // Se estiver ao lado do jogador, ataca
          player.health -= monster.damage;
        } else {
          // Move o monstro em direção ao jogador
          if (Math.abs(dx) > Math.abs(dy)) {
            monster.x += dx > 0 ? 1 : -1;
          } else {
            monster.y += dy > 0 ? 1 : -1;
          }
        }
      }

      // Verifica se o jogador morreu
      if (player.health <= 0) {
        alert("Você morreu! Game Over.");
        location.reload();
      }

      update();
    }

    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
          movePlayer(0, -1);
          break;
        case "ArrowDown":
        case "s":
          movePlayer(0, 1);
          break;
        case "ArrowLeft":
        case "a":
          movePlayer(-1, 0);
          break;
        case "ArrowRight":
        case "d":
          movePlayer(1, 0);
          break;
      }
      monsterAI(); // Os monstros se movem após o jogador
    });

    update();
  }

  ngAfterViewInit(): void {
    this.main()
  }
}
