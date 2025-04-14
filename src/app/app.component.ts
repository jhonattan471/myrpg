import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { Mundo } from './models/mundo';
import { Monstro, Objeto } from './models/objeto';
import { CommonModule } from '@angular/common';
import { InventariosComponent } from "./inventarios/inventarios.component";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [CommonModule, InventariosComponent],
  providers: []
})
export class AppComponent implements AfterViewInit {

  mundo!: Mundo
  @ViewChild(InventariosComponent) inventarioComponent

  async ngAfterViewInit() {
    const playerMesh = await this.carregarMesh('/knight.glb')
    this.mundo = new Mundo(this.inventarioComponent)
    this.mundo.adicionarPlayer(playerMesh)
    this.spawnRabit()
    console.log(this.mundo.mapa)
  }

  async spawnRabit() {
    const ratMesh = await this.carregarMesh('/rat.glb', 0.1, 0.1, 0.1)
    interval(1000).subscribe(r => {
      if (this.mundo.objetos.filter(e => e instanceof Monstro).length > 0) return
      let pos = this.getPosicaoAleatoriaDentroDoAlcance({ x: 5, z: 5 }, 5)
      // const monstro = new Monstro(pos.x, pos.z, 0, this.mundo, ratMesh)
      const monstro = new Monstro(0, 0, 0, this.mundo, ratMesh)
      this.mundo.adicionarObjeto(monstro)
    })
    console.log(this.mundo.mapa)
  }

  adicionarObjeto1() {
    const objeto = new Objeto(0, 0, 10)
    this.mundo.adicionarObjeto(objeto)
  }

  adicionarMonstro() {
    const monstro = new Monstro(3, 3, 0, this.mundo)
    this.mundo.adicionarObjeto(monstro)
  }

  async carregarMesh(path, scaleX = 0.5, scaleZ = 0.5, scaleY = 0.5) {
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      loader.load(path, (gltf) => {
        const modelo = gltf.scene;
        modelo.scale.set(scaleX, scaleZ, scaleY); // ajuste se necessário

        const wrapper = new THREE.Object3D();
        wrapper.add(modelo);
        wrapper.scale.set(1, 1, 1); // ou aplique no modelo se preferir

        resolve(wrapper)
      });
    })
  }

  getPosicaoAleatoriaDentroDoAlcance(
    origem: { x: number; z: number },
    distanciaMax: number
  ): { x: number; z: number } {
    const opcoes: { x: number; z: number }[] = [];

    for (let dx = -distanciaMax; dx <= distanciaMax; dx++) {
      for (let dz = -distanciaMax; dz <= distanciaMax; dz++) {
        const chebyshev = Math.max(Math.abs(dx), Math.abs(dz));
        if (chebyshev <= distanciaMax) {
          opcoes.push({ x: origem.x + dx, z: origem.z + dz });
        }
      }
    }

    // Remove a posição original se não quiser incluir ela
    const opcoesSemOrigem = opcoes.filter(p => !(p.x === origem.x && p.z === origem.z));

    // Escolhe aleatoriamente
    return opcoesSemOrigem[Math.floor(Math.random() * opcoesSemOrigem.length)];
  }
}
