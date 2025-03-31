import { AfterViewInit, Component } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Mundo } from './models/mundo';
import { Objeto, Player } from './models/objeto';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    const mundo = new Mundo()
    mundo.adicionarPlayer()
    mundo.adicionarObjeto()
  }
}
