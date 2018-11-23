$(document).ready(function(){

	if ( ! Detector.webgl ) {Detector.addGetWebGLMessage();}
	var container, stats, raycaster, camera, scene, renderer, mirrorCamera, mirrorCamera_2;
	var particles, geometry, material, i, color, sprite, size;
	var mouseX = 0, mouseY = 0;
	var mouse;

	var glitchPass;

	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;


	var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;

	var aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

	var element_count = 15;
	var seg_angle = (360 / element_count);
	var outer_radius = 450;

	var fullLoaded = false;

	init_3d_scene();

	function MouseWheelHandler(e) {
		var e = window.event || e; 
		e.preventDefault();
	}

	function init_3d_scene() {
		container = document.getElementById( "can-container" );

		renderer = new THREE.WebGLRenderer( { antialias: true, alpha:true } );
		//renderer.setClearColor( 0xd0c7c0, 1);
		renderer.setClearColor( 0xf2ebe3, 1);
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( renderer.domElement );

		camera = new THREE.PerspectiveCamera(50, aspect, 1, 5000 );

		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 1350;

		scene = new THREE.Scene();

		// add subtle ambient lighting
		var ambientLight = new THREE.AmbientLight(0xf4f4f4);
		scene.add(ambientLight);

		// directional lighting
		var directionalLight = new THREE.DirectionalLight(0xffffff,0.2);
		directionalLight.position.set(1, 0, 1).normalize();
		scene.add(directionalLight);


		var directionalLight_2 = new THREE.DirectionalLight(0xead282,0.25);
		directionalLight_2.position.set(-1, 1, 1).normalize();
		scene.add(directionalLight_2);


		/*stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.right = '0px';
	container.appendChild( stats.domElement );*/

		geometry = new THREE.Geometry();

		mirrorCamera = new THREE.CubeCamera( 0.1, 3000, 1280 );
		mirrorCamera.position.x = 0;
		mirrorCamera.position.y = 0;
		mirrorCamera.position.z = -1600;


		var visual_ele_2 = new THREE.Group();
		visual_ele_2.name = "visual_ele_group_2";


		var circle = new THREE.Mesh( new THREE.CircleGeometry( 420, 48, 0, 3.15 ),
									new THREE.MeshStandardMaterial( { color: 0xFF9B2B, metalness: 0.85, roughness: 0.5, envMap: mirrorCamera.renderTarget }));

		circle.material.transparent = true;
		circle.position.x = 150;
		circle.position.y = 1;
		circle.position.z = 0;
		circle.rotation.z = 45 *  Math.PI/180;
		circle.position.z = -250;
		circle.name = "circle";
		scene.add(circle);


		var visual_ele = new THREE.Group();
		visual_ele.name = "visual_ele_group"; 

		var loader_texture = new THREE.TextureLoader();
		var pearl_texture = loader_texture.load("resources/images/texture-pearl-2.jpg");

		for(var i = 0; i < element_count; i++){

			var rand_scale = Math.round(Math.random()*25 + 12);
			var object = new THREE.Mesh( 
				new THREE.SphereGeometry( rand_scale, 128, 128 ),
				new THREE.MeshStandardMaterial({
					metalness: 0.3,
					roughness: 0.5,
					map: pearl_texture,
					transparent: true,
					opacity: 1
				})
			);
			object.position.x = (Math.sin((seg_angle * i) * (Math.PI / 180)) * (outer_radius)) + Math.random() * 350 - 175;
			object.position.y = (Math.cos((seg_angle * i) * (Math.PI / 180)) * (outer_radius)) + Math.random() * 90 - 40;
			object.position.z = Math.random() * 1200 - 500;
			visual_ele.add( object );
		}
		scene.add(visual_ele);

		var onProgress = function ( xhr ) {
			if ( xhr.lengthComputable ) {
				var percentComplete = xhr.loaded / xhr.total * 100;
				$('.preloader .progressbar').width(percentComplete+'vw');
			}
			if(percentComplete==100){
				setTimeout(function(){
					$('.preloader').css('top', '0px');
					$('.preloader .progressbar').css('height', '100vh');
					animate();
					
					$('.preloader').fadeOut(800,function(){
						$('#can-container, footer').css('opacity','1');
						$('#monogram').addClass('anim');	
					})
				},200);
			}
		};
		var onError = function ( xhr ) {};

		var mtlLoader = new THREE.MTLLoader();
		mtlLoader.setPath( 'resources/3d/model/');
		mtlLoader.load( 'Model.mtl', function( materials ) {
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials( materials );
			objLoader.setPath( 'resources/3d/model/' );
			objLoader.load( 'Model.obj', function ( object ) {

				object.scale.x = object.scale.y = object.scale.z = 100;
				object.position.x = 00;
				object.position.y = -190;
				object.position.z = 0;

				object.rotation.x = -Math.PI / 2.3;
				object.rotation.y = -Math.PI / 180;
				object.rotation.z =  Math.PI / 2.3;

				object.name = "model";

				scene.add( object );

				fullLoaded = true;				

			}, onProgress, onError );
		});


		raycaster = new THREE.Raycaster();
		mouse = new THREE.Vector2();

		//
		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		window.addEventListener( 'resize', onWindowResize, false );
	}

	function onWindowResize() {
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function onDocumentMouseMove( event ) {
		event.preventDefault();
		mouseX = event.clientX - windowHalfX;
		mouseY = event.clientY - windowHalfY;
	}

	function animate() {
		requestAnimationFrame( animate );
		render();
		//stats.update();
	}

	function render() {
		camera.lookAt( scene.position );

		var mod_obj = scene.getObjectByName('visual_ele_group');
		mod_obj.rotation.x += (  (mouseY*0.0009) - mod_obj.rotation.x ) * 0.06;
		mod_obj.rotation.y += ( (mouseX*0.0009) - mod_obj.rotation.y ) * 0.06;

		var mod_obj_3 = scene.getObjectByName('circle');
		mod_obj_3.rotation.x += (  (mouseY*0.0001) - mod_obj_3.rotation.x ) * 0.06;
		mod_obj_3.rotation.y += ( (mouseX*0.0001) - mod_obj_3.rotation.y ) * 0.06;

		if(fullLoaded){
			var mod_obj_2 = scene.getObjectByName('model');
			mod_obj_2.rotation.z += ( (mouseX*0.0002) - mod_obj_2.rotation.z + (Math.PI / 2.3)) * 0.06;
			mod_obj_2.rotation.x += ( (mouseY*0.0002) - mod_obj_2.rotation.x - (Math.PI / 2.3) ) * 0.06;
		}
		mirrorCamera.updateCubeMap( renderer, scene );
		renderer.render( scene, camera );
	}
});

