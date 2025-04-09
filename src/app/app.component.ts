import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { Mundo } from './models/mundo';
import { Monstro, Objeto } from './models/objeto';
import { CommonModule } from '@angular/common';
import { InventariosComponent } from "./inventarios/inventarios.component";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
    this.adicionarMonstro()
  }

  adicionarObjeto1() {
    const objeto = new Objeto(0, 0, -5)
    this.mundo.adicionarObjeto(objeto)
  }

  adicionarMonstro() {
    const monstro = new Monstro(0, -5, 0)
    this.mundo.adicionarObjeto(monstro)
  }

  async carregarMesh(path) {
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      loader.load(path, (gltf) => {
        const modelo = gltf.scene;
        modelo.scale.set(0.5, 0.5, 0.5); // ajuste se necessário

        const wrapper = new THREE.Object3D();
        wrapper.add(modelo);
        wrapper.scale.set(1, 1, 1); // ou aplique no modelo se preferir

        resolve(wrapper)
      });
    })
  }
}
