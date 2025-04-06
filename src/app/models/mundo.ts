import { NotPossibleError } from "./errors";
import { Objeto, Piso, Player } from "./objeto";
import { Posicao } from "./posicao";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Mundo {
    scene!: THREE.Scene
    camera!: THREE.PerspectiveCamera
    renderer!: THREE.WebGLRenderer
    controls!: OrbitControls
    keys = {}
    player = new Player()
    tamanho = 5
    mapa: Posicao[][] = []

    constructor() {
        this.initScene();
        this.adicionarRaycastSelecao()
    }

    private initScene(): void {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);


        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 10);

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

    gerarChaoGrid() {
        const offset = this.tamanho / 2
        for (let x = 0; x < this.tamanho; x++) {
            let linha: Posicao[] = []
            this.mapa[x] = []
            for (let z = 0; z < this.tamanho; z++) {
                const isPreto = (x + z) % 2 === 0;
                const corTile = isPreto ? 0x000000 : 0xffffff; // preto e branco
                const piso = new Piso(x - offset, 1, z - offset, corTile)
                this.scene.add(piso.mesh);
                linha.push(new Posicao(x, 0, z, [piso]));
            }
            this.mapa[x].push(...linha)
        }
        console.log('mapa', this.mapa)
    }

    adicionarObjeto(objeto: Objeto = new Objeto()): THREE.Mesh {
        if (this.posicaoEstaDisponivel(objeto.mesh.position.x, objeto.mesh.position.z)) {
            throw new NotPossibleError();
        }
        this.objetos.push(objeto)
        this.scene.add(objeto.mesh);
        return objeto.mesh;
    }

    adicionarPlayer() {
        this.player = new Player()
        if (this.posicaoEstaDisponivel(this.player.mesh.position.x, this.player.mesh.position.z)) {
            throw new NotPossibleError();
        }

        this.mapa[this.player.x][this.player.z].objetos.push(this.player)
    }

    movimentoEstaDisponivel(objeto: Objeto, x, z) {
        if (this.posicaoEstaDisponivel(x, z)) {
            throw new NotPossibleError();
        }
    }

    posicaoEstaDisponivel(x, z) {
        let tile = this.mapa[x][z]
        const bloqueada = tile.objetos.filter(e => e.bloqueia == true).length
        return bloqueada;
    }

    getScene(): THREE.Scene {
        return this.scene;
    }


    ultimoMovimento = 0;
    intervalo = 200; // milissegundos (0.2s entre movimentos)

    movimentarObjeto(objeto: Objeto) {
        console.log("moving")
        const agora = performance.now();
        if (agora - this.ultimoMovimento < this.intervalo) return;
        console.log("moving2")
        let dx = 0, dz = 0;
        if (objeto.controle.keys['w']) dz -= 1;
        if (objeto.controle.keys['s']) dz += 1;
        if (objeto.controle.keys['a']) dx -= 1;
        if (objeto.controle.keys['d']) dx += 1;

        if (dx === 0 && dz === 0) return;
        console.log("moving3")
        const novoX = objeto.mesh.position.x + dx;
        const novoZ = objeto.mesh.position.z + dz;

        const disponivel = this.posicaoEstaDisponivel(novoX, novoZ);
        if (disponivel) return console.log("posição indisponível.");


        let currentTile = this.mapa[objeto.mesh.position.x][objeto.mesh.position.z]
        console.log("currentTile", currentTile)
        let nextTile = this.mapa[novoX][novoZ]
        console.log("nextTile", nextTile)
        currentTile.objetos = currentTile.objetos.filter(e => e.id == objeto.id)
        nextTile.objetos.push(objeto)
        this.ultimoMovimento = agora;
    }

    renderTile(posicao: Posicao) {
        for (let objeto of posicao.objetos) {
            objeto.mesh.position.set(posicao.x, objeto.mesh.position.y, posicao.z);
        }
    }

    get objetos(): Objeto[] {
        const todosObjetos: any[] = [];

        for (const linha of this.mapa) {
            for (const posicao of linha) {
                if (posicao.objetos) {
                    todosObjetos.push(...posicao.objetos);
                }
            }
        }

        return todosObjetos;
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

            if (intersects.length > 0) {
                const selecionado = this.objetos.find(obj => obj.mesh === intersects[0].object);
                console.log('selecionado', selecionado)
                if (selecionado) {
                    selecionado.destacarNaCena(this.scene);
                }
            }
        });
    }

    animate(): void {
        requestAnimationFrame(() => this.animate());
        for (let row of this.mapa) {
            for (let posicao of row) {
                // posicao.objetos.forEach(e => e.createMesh())
                for (let objeto of posicao.objetos) {
                    if (objeto instanceof Player) {
                        // this.movimentarObjeto(objeto)
                    }
                    objeto.mesh.position.x = posicao.x
                    objeto.mesh.position.z = posicao.z
                }
            }
        }
        this.controls.update();
        // atualizar câmera
        // this.camera.position.x = this.player.mesh.position.x + 0;
        // this.camera.position.z = this.player.mesh.position.z + 10;
        // this.camera.position.y = this.player.mesh.position.y + 20;
        // this.camera.lookAt(this.player.mesh.position);

        this.renderer.render(this.scene, this.camera);
    }

}