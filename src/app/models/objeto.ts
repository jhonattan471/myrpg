
import * as THREE from 'three';
import { Posicao } from './posicao';
import { Controle, ControlePlayer } from './controle';

let selectionBox: THREE.LineSegments | null = null;

export class Objeto {
    static idCounter = 0;
    id: number;
    tamanho = 1;
    mesh!: THREE.Mesh;
    speed = 0.02;
    controle = new Controle()

    constructor(public posicao: Posicao = new Posicao()) {
        this.id = Objeto.idCounter++;
        this.createMesh();
        this.mesh.position.set(posicao.x, posicao.y, posicao.z);
    }

    mover(posicao: Posicao) {
        this.mesh.position.set(posicao.x, posicao.y, posicao.z);
    }

    moverParaTile(x: number, z: number) {
        this.posicao.x = x;
        this.posicao.z = z;
        this.mesh.position.set(x + 0.5, this.mesh.position.y, z + 0.5);
    }

    createMesh() {
        // const geometry = new THREE.BoxGeometry();
        // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // this.mesh = new THREE.Mesh(geometry, material);
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = this.posicao.x
        cube.position.y = this.posicao.y
        cube.position.z = this.posicao.z
        this.mesh = cube;
    }

    destacarNaCena(scene: THREE.Scene) {
        const box = new THREE.Box3().setFromObject(this.mesh);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        if (selectionBox) {
            scene.remove(selectionBox);
            selectionBox.geometry.dispose();
            (selectionBox.material as THREE.Material).dispose();
        }

        const geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(size.x + .5, 0.01, size.z + .5));
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        selectionBox = new THREE.LineSegments(geometry, material);
        selectionBox.position.set(center.x, box.min.y + 0.01, center.z);
        scene.add(selectionBox);
    }
}

export class Player extends Objeto {
    cor = 'red';
    playerHealth = 100;

    constructor(posicao: Posicao = new Posicao()) {
        super(posicao);
        this.controle = new ControlePlayer();
    }

    override createMesh() {
        const geometry = new THREE.BoxGeometry(this.tamanho, this.tamanho, this.tamanho);
        const material = new THREE.MeshBasicMaterial({ color: this.cor });
        this.mesh = new THREE.Mesh(geometry, material);
    }
}
