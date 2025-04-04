import { AfterViewInit, Component } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Mundo } from './models/mundo';
import { Objeto, Player } from './models/objeto';
import { Posicao } from './models/posicao';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  mundo!: Mundo
  ngAfterViewInit(): void {
    this.mundo = new Mundo()
    this.mundo.adicionarPlayer()
    // this.adicionarObjeto1()
  }

  adicionarObjeto1() {
    let posicao = new Posicao()
    posicao.x = 0
    posicao.y = 0
    posicao.z = -5
    const objeto = new Objeto(posicao)
    this.mundo.adicionarObjeto(objeto)
  }
}
