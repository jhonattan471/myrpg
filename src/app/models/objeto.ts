import { Controle, ControlePlayer } from "./controle";
import { Mundo } from "./mundo"
import { Posicao } from "./posicao"
import * as THREE from 'three';

export class Objeto {
    static contadorId = 0
    id: number;
    tamanho = 1
    mesh: THREE.Mesh
    speed = .02
    controle = new Controle()

    constructor(public posicao: Posicao = new Posicao()) {
        this.id = ++Objeto.contadorId; // Incrementa o ID automaticamente
        this.createMesh()
    }

    mover(posicao: Posicao) {
        Object.assign(this.mesh.position, posicao)
    }

    createMesh() {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = this.posicao.x
        cube.position.y = this.posicao.y
        cube.position.z = this.posicao.z
        this.mesh = cube;
    }
}


export class Player extends Objeto {
    cor: string = "red"
    playerHealth = 100;

    constructor() {
        super()
        this.controle = new ControlePlayer()
    }
    override createMesh(): void {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = this.posicao.x
        cube.position.y = this.posicao.y
        cube.position.z = this.posicao.z
        this.mesh = cube;
    }
}