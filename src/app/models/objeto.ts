
import * as THREE from 'three';
import { Controle, ControleIA, ControlePlayer } from './controle';
import { Inventario } from './inventario';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let selectionBox: THREE.LineSegments | null = null;

export class Objeto {
    static idCounter = 0;
    id: number;
    tamanho = 1;
    mesh!: any;
    speed = 0.02;
    controle = new Controle()
    health = 100;
    maxHealth = 100;
    bloqueia = false
    forca = 10
    distanciaAtaque = 1
    dataUltimoAtaque
    velocidadeDeAtaque
    podeAtacar = true
    morto = false
    inventario?: Inventario
    healthBarElement
    spawnPoint
    distanceAllowedFromSpawn = 10
    ultimoMovimento = 0

    constructor(public x = 0, public z = 0, public y = 0) {
        this.id = Objeto.idCounter++;
        this.spawnPoint = { x, y, z }
        this.healthBarElement = document.createElement('div');
        this.healthBarElement.className = 'health-bar';
        this.healthBarElement.innerHTML = '<div class="fill"></div>';
        document.body.appendChild(this.healthBarElement);
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

    atacar(alvo: Objeto) {
        try {
            this.podeAtacar = false
            const dano = this.calcular_dano(alvo)
            const distancia = this.calcularDistancia(alvo)
            if (distancia > this.distanciaAtaque) return console.log("tentnado ataque", distancia, this.distanciaAtaque, this, alvo)
            alvo.receberDano(dano)
            if (alvo.morto) {
                this.controle.objetoSelecionado = undefined
            }
        } catch (e) {
            throw e
        } finally {
            setTimeout(() => {
                this.podeAtacar = true
            }, 1000);
        }
    }

    calcular_dano(objeto: Objeto) {
        return 10
    }

    receberDano(quantidade) {
        console.log("💥 DANO RECEBIDO", this, quantidade)
        this.health -= quantidade;
        if (this.health <= 0) {
            this.morrer()
        }
    }

    calcularDistancia(alvo: Objeto): number {
        const dx = Math.abs(this.x - alvo.x);
        const dz = Math.abs(this.z - alvo.z);
        return Math.max(dx, dz);
    }

    morrer() {
        this.healthBarElement.remove()
        console.log("✝ MORREU", this)
        this.mesh.material = new THREE.MeshBasicMaterial({ color: 0x555555 });
        this.morto = true
        // const pos = this.mesh.position.clone();
        // // cena.remove(this.mesh); // remove o antigo

        // const geometry = new THREE.BoxGeometry(1, 1, 1);
        // const material = new THREE.MeshBasicMaterial({ color: 'red' });
        // const deadMesh = new THREE.Mesh(geometry, material);
        // deadMesh.position.copy(pos);

        // this.mesh = deadMesh;
        // // cena.add(this.mesh);
        // this.mesh.visible = false
        // this.mesh.clear()
    }

    gerarObjetoMorto() {
        let objeto = new MonstroMorto(this.x, this.z, this.y - .25)
        return objeto
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

    constructor(x = 0, z = 0, y = 0, mesh?) {
        super(x, z, y);
        this.controle = new ControlePlayer();
        if (mesh) {
            this.mesh = mesh
        } else {
            this.createMesh();
        }
        this.bloqueia = true
    }

    // override createMesh() {
    //     const loader = new GLTFLoader();
    //     loader.load('/knight.glb', (gltf) => {
    //         const modelo = gltf.scene;
    //         modelo.scale.set(0.5, 0.5, 0.5); // ajuste se necessário

    //         const wrapper = new THREE.Object3D();
    //         wrapper.add(modelo);
    //         wrapper.scale.set(0.5, 0.5, 0.5); // ou aplique no modelo se preferir

    //         this.mesh = wrapper;
    //         console.log('this.mesh', this.mesh)
    //     });
    // }
}
export class Monstro extends Objeto {
    cor = 'yellow';

    constructor(x = 0, z = 0, y = 0, mundo, mesh?) {
        super(x, z, y);
        this.controle = new ControleIA(this, mundo);
        this.health = 100
        this.bloqueia = true
        if (mesh) {
            this.mesh = mesh
            this.mesh['_myid'] = this.id
        } else {
            this.createMesh();
        }
    }

    override createMesh() {
        const geometry = new THREE.BoxGeometry(this.tamanho, this.tamanho, this.tamanho);
        const material = new THREE.MeshBasicMaterial({ color: 'yellow' });
        this.mesh = new THREE.Mesh(geometry, material);
    }
}

export class MonstroMorto extends Objeto {
    constructor(x = 0, z = 0, y = 0) {
        super(x, z, y);
        this.controle = new Controle();
        this.health = 10
        this.createMesh();
        this.bloqueia = false
    }

    override createMesh() {
        const geometry = new THREE.BoxGeometry(.5, .5, .5);
        const material = new THREE.MeshBasicMaterial({ color: 'red' });
        const deadMesh = new THREE.Mesh(geometry, material);
        this.mesh = deadMesh;
        this.inventario = new Inventario()
        this.bloqueia = false
        const qtdGold = Math.ceil(Math.random() * 5)
        for (let i = 0; i < qtdGold; i++) {
            this.inventario.adicionarItem({ icon: '/gold.png' })
        }
    }
}

