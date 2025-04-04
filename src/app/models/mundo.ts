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

    // _adicionarObjetos(objeto: Objeto): THREE.Mesh {
    //     const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
    //     const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    //     let player = new THREE.Mesh(playerGeometry, playerMaterial);
    //     player.position.y = 1;
    //     this.scene.add(player);
    //     return player
    // }

    // criarOChao() {
    //     // // Criando o chão
    //     // const groundGeometry = new THREE.PlaneGeometry(20, 20);
    //     // const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    //     // const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    //     // ground.position.y = -0.5;
    //     // ground.rotation.x = -Math.PI / 2;
    //     // this.scene.add(ground);
    //     const groundGeometry = new THREE.PlaneGeometry(20, 20);
    //     const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    //     const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    //     ground.position.y = -0.5;
    //     ground.rotation.x = -Math.PI / 2;
    //     this.scene.add(ground);

    //     window.addEventListener("resize", () => {
    //         this.camera.aspect = window.innerWidth / window.innerHeight;
    //         this.camera.updateProjectionMatrix();
    //         this.renderer.setSize(window.innerWidth, window.innerHeight);
    //     });

    // }

    gerarChaoGrid(
        scene: THREE.Scene = this.scene,
        tamanho: number = 100
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
                tile.position.set(x - offset + 0.5, -0.5, z - offset + 0.5);
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

    async animate() {
        requestAnimationFrame(this.animate.bind(this));
        // console.log('this.objetos', JSON.stringify(this.objetos))
        for (let objeto of this.objetos) {
            // console.log("movimentando objeto", objeto)
            this.movimentarObjeto(objeto)
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    movimentarObjeto(objeto: Objeto) {
        if (!objeto) return;
        let newPosition = {
            x: objeto.mesh.position.x || 0,
            y: objeto.mesh.position.y || 0,
            z: objeto.mesh.position.z || 0,
        }
        if (objeto.controle.keys['w']) newPosition.z -= objeto.speed
        if (objeto.controle.keys['s']) newPosition.z += objeto.speed
        if (objeto.controle.keys['a']) newPosition.x -= objeto.speed
        if (objeto.controle.keys['d']) newPosition.x += objeto.speed

        let objetoOnPosition = this.getObjectOnPosition(objeto, { ...objeto.mesh.position, ...newPosition } as any)
        if (objetoOnPosition) return
        objeto.mover({
            x: newPosition.x || objeto.mesh.position.x || 0,
            y: newPosition.y || objeto.mesh.position.y || 0,
            z: newPosition.z || objeto.mesh.position.z || 0,
        })
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