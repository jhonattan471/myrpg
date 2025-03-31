import { Mundo } from "./mundo"
import { Posicao } from "./posicao"
import * as THREE from 'three';

export class Objeto {
    static contadorId = 0
    id: number;
    posicao: Posicao = new Posicao()
    tamanho = 1
    mesh: THREE.Mesh
    keys = {}

    constructor() {
        this.id = ++Objeto.contadorId; // Incrementa o ID automaticamente
        this.createMesh()
    }

    mover(posicao: Posicao, mundo: Mundo) {
        Object.assign(this.mesh, posicao)
    }

    createMesh() {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        this.mesh = cube;
    }
}


export class Player extends Objeto {
    cor: string = "red"
    playerSpeed = .02;
    playerHealth = 100;

    override createMesh(): void {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.y = 1
        this.mesh = cube;
    }
}