
    
        const ROOM_WIDTH = 20;
        const ROOM_DEPTH = 20;
        const CAMERA_BOUNDARY_BUFFER = 1;

        const forks = [];
        let health = 3;

        const scene = new THREE.Scene();
        const skyboxLoader = new THREE.CubeTextureLoader();
        const skyboxTexture = skyboxLoader.load([
            'px.png', // right
            'nx.png', // left
            'py.png', // top
            'ny.png', // bottom
            'pz.png', // back
            'nz.png'  // front
        ]);
        scene.background = skyboxTexture;

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0.5, 2);
        camera.userData = {
            minX: -ROOM_WIDTH / 2 + CAMERA_BOUNDARY_BUFFER,
            maxX: ROOM_WIDTH / 2 - CAMERA_BOUNDARY_BUFFER,
            minZ: -ROOM_DEPTH / 2 + CAMERA_BOUNDARY_BUFFER,
            maxZ: ROOM_DEPTH / 2 - CAMERA_BOUNDARY_BUFFER
        };

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true; 
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffddaa, 1, 15);
        pointLight.position.set(0, 5, -5);
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.width = 1024;
        pointLight.shadow.mapSize.height = 1024;
        pointLight.shadow.camera.near = 0.1;
        pointLight.shadow.camera.far = 15;
        scene.add(pointLight);

        const healthElement = document.createElement('div');
        healthElement.style.color = 'white';
        healthElement.style.position = 'absolute';
        healthElement.style.top = '70px';
        healthElement.style.left = '20px';
        healthElement.style.backgroundColor = 'rgba(0,0,0,0.5)';
        healthElement.style.padding = '5px';
        healthElement.style.borderRadius = '5px';
        healthElement.textContent = '❤️❤️❤️';
        document.body.appendChild(healthElement);

        let clock = new THREE.Clock();

        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshStandardMaterial({
            roughness: 0.8,
            metalness: 0.2
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('floor.jpg', function(texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(8, 8);
            floor.material.map = texture;
            floor.material.needsUpdate = true;
        }, undefined, function(error) {
            console.error('Error loading floor texture:', error);
        });

        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xF5F5DC,
            side: THREE.DoubleSide
        });

        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 10),
            wallMaterial
        );
        backWall.position.z = -10;
        backWall.position.y = 5; 
        backWall.receiveShadow = true;
        scene.add(backWall);

        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 10),
            wallMaterial
        );
        leftWall.rotation.y = Math.PI / 2; 
        leftWall.position.x = -10;
        leftWall.position.y = 5;
        leftWall.receiveShadow = true;
        scene.add(leftWall);

        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 10),
            wallMaterial
        );
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.x = 10;
        rightWall.position.y = 5;
        rightWall.receiveShadow = true;
        scene.add(rightWall);

        function createTable() {
            const tableGroup = new THREE.Group();

            const tableTopGeometry = new THREE.BoxGeometry(8, 0.75, 4);
            const tableTopMaterial = new THREE.MeshStandardMaterial({
                color: 0x8B4513,
                roughness: 0.7
            });
            const tableTop = new THREE.Mesh(tableTopGeometry, tableTopMaterial);
            tableTop.position.y = 2.25;
            tableTop.castShadow = true;
            tableTop.receiveShadow = true;
            tableGroup.add(tableTop);

            const legGeometry = new THREE.BoxGeometry(0.5, 2, 0.5); 
            const legMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });

            for (let i = 0; i < 4; i++) {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.y = 1;
                leg.position.x = (i % 2 === 0 ? 3.5 : -3.5);
                leg.position.z = (i < 2 ? 1.5 : -1.5);
                leg.castShadow = true;
                tableGroup.add(leg);
            }

            tableGroup.position.y = 0;
            return tableGroup;
        }

        const table = createTable();
        table.position.z = -5;
        scene.add(table);

        function createPlate() {
            const plateGroup = new THREE.Group(); 

            const plateGeometry = new THREE.CylinderGeometry(1, 1, 0.1, 32); 
            const plateMaterial = new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
                roughness: 0.2,
                metalness: 0.7
            });
            const plate = new THREE.Mesh(plateGeometry, plateMaterial);
            plate.position.y = 2.5;
            plate.rotation.x = Math.PI;
            plate.castShadow = true;
            plate.receiveShadow = true;
            plateGroup.add(plate);

            const appleGeometry = new THREE.SphereGeometry(0.3, 32, 32);
            const appleMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
            const apple = new THREE.Mesh(appleGeometry, appleMaterial);
            apple.position.set(0, 2.8, 0.2);
            apple.castShadow = true;
            plateGroup.add(apple);

            plateGroup.position.set(0, 0.15, -1.2);
            return plateGroup;
        }

        const plate = createPlate();
        table.add(plate);

        function createChair() {
            const chairGroup = new THREE.Group();

            const seatGeometry = new THREE.BoxGeometry(1.5, 0.3, 1.5);
            const seatMaterial = new THREE.MeshStandardMaterial({ color: 0xA0522D });
            const seat = new THREE.Mesh(seatGeometry, seatMaterial);
            seat.position.y = 1.5;
            seat.castShadow = true;
            seat.receiveShadow = true;
            chairGroup.add(seat);

            const backGeometry = new THREE.BoxGeometry(1.5, 2.5, 0.2);
            const backMaterial = new THREE.MeshStandardMaterial({ color: 0xA0522D });
            const back = new THREE.Mesh(backGeometry, backMaterial);
            back.position.y = 2.75;
            back.position.z = -0.75;
            back.castShadow = true;
            chairGroup.add(back);

            const legGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.2);
            const legMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });

            for (let i = 0; i < 4; i++) {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.y = 0.75;
                leg.position.x = (i % 2 === 0 ? 0.6 : -0.6);
                leg.position.z = (i < 2 ? 0.6 : -0.6);
                leg.castShadow = true;
                chairGroup.add(leg);
            }

            return chairGroup;
        }

        const chairPositions = [
            { x: 4, z: -5, rot: -Math.PI / 2 },   
            { x: -4, z: -5, rot: Math.PI / 2 }, 
            { x: 0, z: -8, rot: 0 },
            { x: 0, z: -2, rot: Math.PI }
        ];

        chairPositions.forEach(pos => {
            const chair = createChair();
            chair.position.set(pos.x, 0, pos.z);
            chair.rotation.y = pos.rot;
            scene.add(chair);
        });

        const loader = new THREE.GLTFLoader();
        let glbVase; 

        loader.load(
            'Tall_Vase.glb',
            function (gltf) {
                glbVase = gltf.scene;
                glbVase.position.set(5, 0, -8);
                glbVase.scale.set(22, 35, 22); 

                glbVase.traverse(function (node) {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                });
                scene.add(glbVase);
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.error('Error loading GLB vase:', error);
            }
        );

        const controls = new THREE.PointerLockControls(camera, document.body);
        scene.add(controls.getObject());

        document.addEventListener('click', () => {
            if (!controls.isLocked) {
                controls.lock();
            }
        });

        const keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            ' ': false,
            shift: false
        };

        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key in keys) keys[key] = true;
        });

        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key in keys) keys[key] = false;
        });

        

        function animate() {
            requestAnimationFrame(animate);

            const delta = clock.getDelta();
            const time = clock.getElapsedTime();

            const velocity = new THREE.Vector3();
            const speed = 5; 

            if (keys.w) velocity.z -= 1;
            if (keys.s) velocity.z += 1;
            if (keys.a) velocity.x -= 1;
            if (keys.d) velocity.x += 1;
            if (keys[' ']) velocity.y += 1;
            if (keys.shift) velocity.y -= 1;

            velocity.normalize().multiplyScalar(speed * delta);
            controls.getObject().position.add(velocity);

            const camPos = controls.getObject().position;
            camPos.x = Math.max(camera.userData.minX, Math.min(camera.userData.maxX, camPos.x));
            camPos.z = Math.max(camera.userData.minZ, Math.min(camera.userData.maxZ, camPos.z));
            camPos.y = Math.max(0.2, camPos.y);

            // If you want the GLB vase to rotate, uncomment this:
            // if (glbVase) {
            //     glbVase.rotation.y += delta * 0.5;
            // }

            if (Math.random() < 0.01 && forks.length < 5) {
                forks.push(createFork());
            }

            for (let i = 0; i < forks.length; i++) {
                forks[i].position.y -= 0.1;

                if (forks[i].position.y < 0) {
                    scene.remove(forks[i]);
                    forks.splice(i, 1);
                    i--;
                }
            }

            const playerPos = controls.getObject().position;
            for (let i = 0; i < forks.length; i++) {
                if (forks[i].position.distanceTo(playerPos) < 3.5) {
                    scene.remove(forks[i]);
                    forks.splice(i, 1);
                    health--;
                    healthElement.textContent = '❤️'.repeat(health);

                    if (health <= 0) {
                        healthElement.textContent = "Game Over! Refresh to restart.";
                        controls.unlock();
                    }
                    break;
                }
            }

            renderer.render(scene, camera);
        }

    function createFork() {
        const forkGroup = new THREE.Group();

        const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
        const handleMaterial = new THREE.MeshStandardMaterial({ color: 0xAAAAAA });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.y = 0.25;
        forkGroup.add(handle);

        const prongsGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.05);
        const prongsMaterial = new THREE.MeshStandardMaterial({ color: 0xDDDDDD });
        const prongs = new THREE.Mesh(prongsGeometry, prongsMaterial);
        prongs.position.y = 0.5;
        forkGroup.add(prongs);

        forkGroup.scale.set(5, 5, 5);

        forkGroup.position.set(
            (Math.random() * 15) - 7.5,
            10,
            (Math.random() * 10) - 10
        );

        forkGroup.rotation.x = Math.PI / 2;
        forkGroup.castShadow = true;
        scene.add(forkGroup);

        return forkGroup;
    }

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight; 
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        window.onload = function () {
            animate();
        };
