import { AfterViewInit, Component } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  scene
  camera
  renderer
  player
  controls;
  enemies: any[] = [];
  sword
  shield;
  enemySpawnInterval;

  ngAfterViewInit() {
    console.log("init")
    this.init()
    console.log("animate")
    this.animate()

    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 5, 10);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    this.scene.add(light);

    // Criando o chão
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    // Criando o jogador
    const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
    const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    this.player = new THREE.Mesh(playerGeometry, playerMaterial);
    this.player.position.y = 1;
    this.scene.add(this.player);

    this.loadEquipment();

    this.spawnEnemies();
    this.enemySpawnInterval = setInterval(this.spawnEnemies.bind(this), 5000);

    document.addEventListener('keydown', this.movePlayer.bind(this));
  }

  loadEquipment() {
    const swordGeometry = new THREE.BoxGeometry(0.1, 1, 0.3);
    const swordMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.sword = new THREE.Mesh(swordGeometry, swordMaterial);
    this.sword.position.set(0.5, 1, 0);
    this.player.add(this.sword);

    const shieldGeometry = new THREE.BoxGeometry(0.7, 1, 0.1);
    const shieldMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    this.shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
    this.shield.position.set(-0.7, 1, 0);
    this.player.add(this.shield);
  }

  spawnEnemies() {
    if (!this.scene) return

    const enemyGeometry = new THREE.BoxGeometry(1, 2, 1);
    const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(Math.random() * 10 - 5, 1, Math.random() * 10 - 5);
    this.scene.add(enemy);
    this.enemies.push(enemy);
  }

  movePlayer(event) {
    if (!this.player) return
    switch (event.key) {
      case 'w': this.player.position.z -= 0.2; break;
      case 's': this.player.position.z += 0.2; break;
      case 'a': this.player.position.x -= 0.2; break;
      case 'd': this.player.position.x += 0.2; break;
      case ' ': this.attack(); break;
    }
  }

  attack() {
    for (let enemy of this.enemies) {
      if (this.player.position.distanceTo(enemy.position) < 2) {
        this.scene.remove(enemy);
        this.enemies = this.enemies.filter(e => e !== enemy);
      }
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
