import { NotPossibleError } from "./errors";
import { Objeto, Player } from "./objeto";
import { Posicao } from "./posicao";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
export interface TileInfo {
    x: number;
    z: number;
    mesh: THREE.Mesh;
    borda: THREE.LineSegments;
}

export class Mundo {
    objetos: Objeto[] = []
    scene!: THREE.Scene
    camera!: THREE.PerspectiveCamera
    renderer!: THREE.WebGLRenderer
    controls!: OrbitControls
    keys = {}
    player = new Player()

    constructor() {
        this.initScene();
        this.adicionarRaycastSelecao()
    }

    private initScene(): void {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(800, 600);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 5);
        this.scene.add(light);


        window.addEventListener("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        this.gerarChaoGrid()
        this.animate()
    }

    gerarChaoGrid(
        scene: THREE.Scene = this.scene,
        tamanho: number = 20
    ): TileInfo[][] {
        const tileSize = 1;
        const tileGeometry = new THREE.BoxGeometry(tileSize, 0.1, tileSize);
        const tileMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });

        const grid: TileInfo[][] = [];
        const offset = tamanho / 2;

        for (let x = 0; x < tamanho; x++) {
            const linha: TileInfo[] = [];

            for (let z = 0; z < tamanho; z++) {
                const tile = new THREE.Mesh(tileGeometry, tileMaterial);
                tile.position.set(x - offset + 0.5, -0.6, z - offset + 0.5);
                scene.add(tile);

                const edges = new THREE.EdgesGeometry(tileGeometry);
                const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
                const border = new THREE.LineSegments(edges, lineMaterial);
                border.position.copy(tile.position);
                scene.add(border);

                linha.push({
                    x,
                    z,
                    mesh: tile,
                    borda: border
                });
            }

            grid.push(linha);
        }

        return grid;
    }


    adicionarObjeto(objeto: Objeto = new Objeto()): THREE.Mesh {
        if (this.pegarObjetoNaPosciao(objeto.mesh.position)) {
            throw new NotPossibleError();
        }
        this.objetos.push(objeto)
        this.scene.add(objeto.mesh);
        return objeto.mesh;
    }

    adicionarPlayer() {
        this.player = new Player()
        if (this.pegarObjetoNaPosciao(this.player.mesh.position)) {
            throw new NotPossibleError();
        }
        this.objetos.push(this.player)
        this.scene.add(this.player.mesh);
    }

    movimentoEstaDisponivel(objeto: Objeto, posicao: Posicao) {
        if (this.pegarObjetoNaPosciao(posicao)) {
            throw new NotPossibleError();
        }
    }

    pegarObjetoNaPosciao(posicao: Posicao) {
        return this.objetos.find(o => {
            const sameX = o.mesh.position.x == posicao.x
            const sameY = o.mesh.position.y == posicao.y
            const sameZ = o.mesh.position.z == posicao.z

            if (sameX && sameY && sameZ) {
                return true
            }
            return false
        })
    }

    getScene(): THREE.Scene {
        return this.scene;
    }

    animate(): void {
        requestAnimationFrame(() => this.animate());
        for (let objeto of this.objetos) {
            // console.log("movimentando objeto", objeto)
            this.movimentarObjeto(objeto)
        }
        this.controls.update();
        // // atualizar câmera
        // this.camera.position.x = this.player.mesh.position.x;
        // this.camera.position.z = this.player.mesh.position.z + 5;
        // this.camera.position.y = this.player.mesh.position.y + 10;
        // this.camera.lookAt(this.player.mesh.position);

        this.renderer.render(this.scene, this.camera);
    }

    ultimoMovimento = 0;
    intervalo = 200; // milissegundos (0.2s entre movimentos)

    movimentarObjeto(objeto: Objeto) {
        const agora = performance.now();
        if (agora - this.ultimoMovimento < this.intervalo) return;

        let dx = 0, dz = 0;
        if (objeto.controle.keys['w']) dz -= 1;
        if (objeto.controle.keys['s']) dz += 1;
        if (objeto.controle.keys['a']) dx -= 1;
        if (objeto.controle.keys['d']) dx += 1;

        if (dx === 0 && dz === 0) return;

        const novoX = objeto.posicao.x + dx;
        const novoZ = objeto.posicao.z + dz;

        const objNoDestino = this.getObjectOnTile(novoX, novoZ);
        if (objNoDestino) return console.log("object on tile.");

        objeto.moverParaTile(novoX, novoZ);
        this.ultimoMovimento = agora;
    }

    getObjectOnPosition(_objeto: Objeto, targetPosition: THREE.Vector3): Objeto | null {
        for (const objeto of this.objetos) {
            if (objeto.id === _objeto.id) continue;

            let distance = objeto.mesh.position.distanceTo(targetPosition)
            // console.log(distance)
            if (distance < (objeto.tamanho)) {
                return objeto;
            }
        }
        return null;
    }

    getObjectOnTile(x: number, z: number): Objeto | null {
        return this.objetos.find(obj => obj.posicao.x === x && obj.posicao.z === z) || null;
    }

    adicionarRaycastSelecao() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        this.renderer.domElement.addEventListener('click', (event: MouseEvent) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);
            const meshes = this.objetos.map(obj => obj.mesh);
            const intersects = raycaster.intersectObjects(meshes);
            console.log('intersects', intersects)
            if (intersects.length > 0) {
                const selecionado = this.objetos.find(obj => obj.mesh === intersects[0].object);
                console.log('selecionado', selecionado)
                if (selecionado) {
                    selecionado.destacarNaCena(this.scene);
                }
            }
        });
    }
}