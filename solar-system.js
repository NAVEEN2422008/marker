AFRAME.registerComponent('solar-system', {
    schema: {
        timeScale: {type: 'number', default: 1.0},
        realScale: {type: 'boolean', default: false}
    },

    init: function() {
        // Cache elements with error handling
        this.celestialBodies = {};
        ['sun', 'earth', 'moon', 'earthOrbit', 'moonOrbit'].forEach(id => {
            const element = this.el.querySelector(`#${id}`);
            if (element) {
                this.celestialBodies[id] = element;
            } else {
                console.warn(`Missing element: ${id}`);
            }
        });

        // Adjusted constants for better visibility
        this.constants = {
            earthDistance: 1.5,    
            moonDistance: 0.4,    
            scales: {
                sun: 0.5,       
                earth: 0.2,     
                moon: 0.08      
            },
            speeds: {
                earthRotation: 0.01,    
                earthOrbit: 0.005,     
                moonRotation: 0.01,    
                moonOrbit: 0.02,      
                sunRotation: 0.001     
            }
        };

        this.lastTime = 0;
        this.isVisible = false;
        this.setupSystem();
    },

    setupSystem: function() {
        if (Object.keys(this.celestialBodies).length === 0) return;

        this.setupBodies();
        this.setupOrbits();
        this.setupLighting();
        this.setupEventListeners();
    },

    setupBodies: function() {
        // Set scales and positions with error handling
        Object.entries(this.celestialBodies).forEach(([body, element]) => {
            if (this.constants.scales[body]) {
                element.object3D.scale.set(...this.constants.scales[body]);
            }
        });

        if (this.celestialBodies.earth) {
            this.celestialBodies.earth.object3D.position.set(this.constants.earthDistance, 0, 0);
        }
        
        if (this.celestialBodies.moon) {
            this.celestialBodies.moon.object3D.position.set(this.constants.moonDistance, 0, 0);
        }
    },

    setupOrbits: function() {
        if (this.celestialBodies.earthOrbit) {
            this.celestialBodies.earthOrbit.object3D.rotation.x = 
                THREE.MathUtils.degToRad(this.constants.earthTilt);
        }
        if (this.celestialBodies.moonOrbit) {
            this.celestialBodies.moonOrbit.object3D.rotation.x = 
                THREE.MathUtils.degToRad(this.constants.moonTilt);
        }
    },

    setupLighting: function() {
        if (!this.celestialBodies.sun) return;
        
        const sunLight = new THREE.PointLight(0xFDB813, 2, 100);
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        
        this.celestialBodies.sun.object3D.add(sunLight);
        this.el.sceneEl.object3D.add(ambientLight);
    },

    setupEventListeners: function() {
        const marker = document.querySelector('a-marker');
        
        marker.addEventListener('markerFound', () => {
            this.el.emit('solar-system-visible', {});
            this.resumeAnimations();
        });

        marker.addEventListener('markerLost', () => {
            this.el.emit('solar-system-hidden', {});
            this.pauseAnimations();
        });
    },

    resumeAnimations: function() {
        Object.values(this.celestialBodies).forEach(body => {
            if (body.getAttribute('animation__rotate')) {
                body.components.animation__rotate.play();
            }
        });
    },

    pauseAnimations: function() {
        Object.values(this.celestialBodies).forEach(body => {
            if (body.getAttribute('animation__rotate')) {
                body.components.animation__rotate.pause();
            }
        });
    },

    tick: function(time, deltaTime) {
        if (!this.celestialBodies.earthOrbit || !this.celestialBodies.moonOrbit) return;
        if (!this.celestialBodies.earthOrbit.object3D.visible) return;

        const dt = (time - this.lastTime) * 0.001 * this.data.timeScale;
        this.lastTime = time;

        // Update rotations
        if (this.celestialBodies.earth) {
            this.celestialBodies.earth.object3D.rotation.y += 
                this.constants.speeds.earthRotation * dt;
        }
        if (this.celestialBodies.moon) {
            this.celestialBodies.moon.object3D.rotation.y += 
                this.constants.speeds.moonRotation * dt;
        }
        if (this.celestialBodies.sun) {
            this.celestialBodies.sun.object3D.rotation.y += 
                this.constants.speeds.sunRotation * dt;
        }

        // Update orbits
        this.celestialBodies.earthOrbit.object3D.rotation.y += this.constants.speeds.earthOrbit * dt;
        this.celestialBodies.moonOrbit.object3D.rotation.y += this.constants.speeds.moonOrbit * dt;
    },

    remove: function() {
        Object.values(this.celestialBodies).forEach(body => {
            if (body && body.parentNode) {
                body.parentNode.removeChild(body);
            }
        });
    }
});

window.addEventListener('load', () => {
    const solarSystem = document.querySelector('#solarSystem');
    solarSystem.setAttribute('solar-system', '');
});
