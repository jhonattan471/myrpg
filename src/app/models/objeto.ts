
import * as THREE from 'three';
import { Controle, ControlePlayer } from './controle';

let selectionBox: THREE.LineSegments | null = null;

export class Objeto {
    static idCounter = 0;
    id: number;
    tamanho = 1;
    mesh!: THREE.Mesh;
    speed = 0.02;
    controle = new Controle()
    health = 100;
    bloqueia = false

    constructor(public x = 0, public z = 0, public y = 0) {
        this.id = Objeto.idCounter++;
    }

    createMesh() {
        // const geometry = new THREE.BoxGeometry();
        // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // this.mesh = new THREE.Mesh(geometry, material);
        // const geometry = new THREE.BoxGeometry();
        // const material = new THREE.MeshBasicMaterial({ color: '0x00ff00 ' });
        // const cube = new THREE.Mesh(geometry, material);
        // cube.position.x = this.x
        // cube.position.y = this.y
        // cube.position.z = this.z
        // this.mesh = cube;
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

export class Piso extends Objeto {
    constructor(x, z, y, public cor: any = 'black') {
        super(x, z, y)
        this.createMesh();
    }

    override createMesh() {
        const tileSize = 1;
        const tileGeometry = new THREE.BoxGeometry(tileSize, 1, tileSize)
        const tileMaterial = new THREE.MeshStandardMaterial({ color: this.cor });
        const tile = new THREE.Mesh(tileGeometry, tileMaterial);
        this.mesh = tile;
    }
}

export class Player extends Objeto {
    cor = 'blue';

    constructor(x = 0, z = 0, y = 0) {
        super(x, z, y);
        this.controle = new ControlePlayer();
        this.createMesh();
        this.bloqueia = true
    }


    override createMesh() {
        const geometry = new THREE.BoxGeometry(this.tamanho, this.tamanho, this.tamanho);
        const material = new THREE.MeshBasicMaterial({ color: this.cor });
        console.log("❤", this, this.cor)
        this.mesh = new THREE.Mesh(geometry, material);
    }
}
export class Monstro extends Objeto {
    cor = 'yellow';

    constructor(x = 0, z = 0, y = 0) {
        super(x, z, y);
        this.controle = new ControlePlayer();
        this.createMesh();
        this.bloqueia = true
    }

    override createMesh() {
        const geometry = new THREE.BoxGeometry(this.tamanho, this.tamanho, this.tamanho);
        const material = new THREE.MeshBasicMaterial({ color: 'yellow' });
        this.mesh = new THREE.Mesh(geometry, material);
    }
}

