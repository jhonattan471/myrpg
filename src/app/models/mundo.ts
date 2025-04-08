import { NotPossibleError } from "./errors";
import { Monstro, Objeto, Piso, Player } from "./objeto";
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
    tamanho = 10
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



        const container = document.getElementById('world-container')

        this.renderer = new THREE.WebGLRenderer();
        // this.renderer.setSize(800, 600);
        this.renderer.setSize(container?.clientWidth || 800, container?.clientHeight || 600);

        container?.appendChild(this.renderer.domElement)

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
        for (let x = 0; x < this.tamanho; x++) {
            let linha: Posicao[] = []
            this.mapa[x] = []
            for (let z = 0; z < this.tamanho; z++) {
                const isPreto = (x + z) % 2 === 0;
                const corTile = isPreto ? 0x000000 : 0xffffff; // preto e branco
                const piso = new Piso(x, z, -1, corTile)
                this.scene.add(piso.mesh);
                linha.push(new Posicao(x, 0, z, [piso]));
            }
            this.mapa[x].push(...linha)
        }
        console.log('mapa', this.mapa)
    }

    adicionarObjeto(objeto: Objeto = new Objeto()): THREE.Mesh {
        if (objeto.bloqueia && this.posicaoEstaDisponivel(objeto.mesh.position.x, objeto.mesh.position.z)) {
            throw new NotPossibleError();
        }
        this.mapa[objeto.mesh.position.x][objeto.mesh.position.z].objetos.push(objeto)
        this.scene.add(objeto.mesh);
        return objeto.mesh;
    }

    adicionarPlayer() {
        this.player = new Player(5, 5, 0)
        if (this.posicaoEstaDisponivel(this.player.mesh.position.x, this.player.mesh.position.z)) {
            throw new NotPossibleError();
        }

        this.mapa[this.player.x][this.player.z].objetos.push(this.player)
        this.scene.add(this.player.mesh);
    }

    movimentoEstaDisponivel(objeto: Objeto, x, z) {
        if (this.posicaoEstaDisponivel(x, z)) {
            throw new NotPossibleError();
        }
    }

    posicaoEstaDisponivel(x, z) {
        let tile = this.mapa[x][z]
        console.log(tile.objetos)
        const bloqueada = tile.objetos.filter(e => e.bloqueia == true).length
        return bloqueada;
    }

    getScene(): THREE.Scene {
        return this.scene;
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
        const novoX = objeto.mesh.position.x + dx;
        const novoZ = objeto.mesh.position.z + dz;

        const disponivel = this.posicaoEstaDisponivel(novoX, novoZ);

        console.log('disponivel', disponivel)
        if (disponivel) return console.log("posição indisponível.");


        let currentTile = this.mapa[objeto.mesh.position.x][objeto.mesh.position.z]
        let nextTile = this.mapa[novoX][novoZ]
        console.log('currentTile', currentTile, 'nextTile', nextTile)
        currentTile.objetos = currentTile.objetos.filter(e => e.id != objeto.id)
        nextTile.objetos.push(objeto)
        objeto.mesh.position.x = novoX
        objeto.mesh.position.z = novoZ

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

            let objetosSelecionados: Objeto[] = []

            for (let meshAtravessado of intersects) {
                const objetoCorrespondente = this.objetos.find(obj => obj.mesh === meshAtravessado.object);
                if (objetoCorrespondente) {
                    objetosSelecionados.push(objetoCorrespondente)
                }
            }

            objetosSelecionados.forEach(e => {
                if (e instanceof Monstro) {
                    e.destacarNaCena(this.scene);
                    this.player.controle.objetoSelecionado = e
                }
            })

            console.log('objetosSelecionados', objetosSelecionados)
        });
    }

    animate(): void {
        requestAnimationFrame(() => this.animate());
        for (let row of this.mapa) {
            for (let posicao of row) {
                for (let objeto of posicao.objetos) {
                    if (objeto instanceof Player) {
                        this.movimentarObjeto(objeto)
                    }
                    objeto.mesh.position.x = posicao.x
                    objeto.mesh.position.z = posicao.z
                    objeto.mesh.position.y = objeto.y
                    objeto.x = posicao.x
                    objeto.z = posicao.z
                    this.gerarMorte(objeto)
                }
                posicao.objetos = posicao.objetos.filter(e => !e.morto)
            }
        }
        this.gerenciarAtaques()
        this.controls.update();
        // atualizar câmera
        // this.camera.position.x = this.player.mesh.position.x + 0;
        // this.camera.position.z = this.player.mesh.position.z + 10;
        // this.camera.position.y = this.player.mesh.position.y + 20;
        // this.camera.lookAt(this.player.mesh.position);

        this.renderer.render(this.scene, this.camera);
    }

    gerenciarAtaques() {
        if (!this.player.podeAtacar) return
        if (!this.player.controle.objetoSelecionado) return

        // this.player.atacar()
        if (this.player.podeAtacar) {
            this.player.atacar(this.player.controle.objetoSelecionado)
        }
    }

    gerarMorte(objeto: Objeto) {
        if (!objeto.morto) return
        let newObjeto = objeto.gerarObjetoMorto()
        this.scene.remove(objeto.mesh)
        this.adicionarObjeto(newObjeto)
    }
}

