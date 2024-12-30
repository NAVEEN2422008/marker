AFRAME.registerComponent('solar-system', {
    schema: {
        timeScale: {type: 'number', default: 1},
        realScale: {type: 'boolean', default: false}
    },

    init: function() {
        // Cache elements
        this.celestialBodies = {
            sun: this.el.querySelector('#sun'),
            earth: this.el.querySelector('#earth'),
            moon: this.el.querySelector('#moon'),
            earthOrbit: this.el.querySelector('#earthOrbit'),
            moonOrbit: this.el.querySelector('#moonOrbit')
        };

        // Astronomical constants
        this.constants = {
            earthYear: 365.25,
            earthDay: 24,
            moonMonth: 27.3,
            sunRotation: 27,
            earthTilt: 23.5,
            moonTilt: 5.14,
            earthDistance: this.data.realScale ? 149.6 : 15, // AU or display units
            moonDistance: this.data.realScale ? 0.384 : 3,  // AU or display units
            scales: {
                sun: [5, 5, 5],
                earth: [1, 1, 1],
                moon: [0.5, 0.5, 0.5]
            }
        };

        this.setupSystem();

        this.el.sceneEl.addEventListener('marker-stabilized', () => {
            // Smooth transitions when marker is stable
            Object.values(this.celestialBodies).forEach(body => {
                body.setAttribute('animation__fade', {
                    property: 'scale',
                    from: '0 0 0',
                    to: body.getAttribute('scale'),
                    dur: 1000,
                    easing: 'easeOutElastic'
                });
            });
        });
    },

    setupSystem: function() {
        this.setupBodies();
        this.setupOrbits();
        this.setupLighting();
        this.setupAnimations();
        this.setupEventListeners();
    },

    setupBodies: function() {
        // Set scales and positions
        Object.entries(this.celestialBodies).forEach(([body, element]) => {
            if (this.constants.scales[body]) {
                element.object3D.scale.set(...this.constants.scales[body]);
            }
        });

        // Set Earth position
        this.celestialBodies.earth.object3D.position.set(this.constants.earthDistance, 0, 0);
        
        // Set Moon position
        this.celestialBodies.moon.object3D.position.set(this.constants.moonDistance, 0, 0);
    },

    setupOrbits: function() {
        // Set orbital tilts
        this.celestialBodies.earthOrbit.object3D.rotation.x = THREE.MathUtils.degToRad(this.constants.earthTilt);
        this.celestialBodies.moonOrbit.object3D.rotation.x = THREE.MathUtils.degToRad(this.constants.moonTilt);
    },

    setupLighting: function() {
        // Sun lighting
        const sunLight = new THREE.PointLight(0xFDB813, 2, 100);
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        
        this.celestialBodies.sun.object3D.add(sunLight);
        this.el.sceneEl.object3D.add(ambientLight);
    },

    setupAnimations: function() {
        // Add animation components
        const bodies = ['sun', 'earth', 'moon'];
        bodies.forEach(body => {
            if (this.celestialBodies[body]) {
                this.setupBodyAnimation(body);
            }
        });
    },

    setupBodyAnimation: function(bodyName) {
        const body = this.celestialBodies[bodyName];
        const duration = this.getRotationDuration(bodyName);
        
        body.setAttribute('animation__rotate', {
            property: 'rotation',
            to: '0 360 0',
            dur: duration,
            easing: 'linear',
            loop: true
        });
    },

    getRotationDuration: function(bodyName) {
        const durations = {
            sun: this.constants.sunRotation * 1000,
            earth: this.constants.earthDay * 1000,
            moon: this.constants.moonMonth * 1000
        };
        return durations[bodyName] || 24000;
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
        if (!this.celestialBodies.earthOrbit.object3D.visible) return;

        const scaledTime = time * this.data.timeScale;
        
        // Update orbits
        this.celestialBodies.earthOrbit.object3D.rotation.y = 
            (scaledTime / (this.constants.earthYear * 1000)) * 2 * Math.PI;
        
        this.celestialBodies.moonOrbit.object3D.rotation.y = 
            (scaledTime / (this.constants.moonMonth * 1000)) * 2 * Math.PI;
    },

    remove: function() {
        // Cleanup
        this.pauseAnimations();
        Object.values(this.celestialBodies).forEach(body => {
            if (body.parentNode) {
                body.parentNode.removeChild(body);
            }
        });
    }
});

AFRAME.registerComponent('better-marker-detection', {
    init: function() {
        this.el.addEventListener('markerFound', () => {
            this.el.sceneEl.emit('marker-found', {markerId: this.el.id});
        });
        
        this.el.addEventListener('markerLost', () => {
            this.el.sceneEl.emit('marker-lost', {markerId: this.el.id});
        });
    }
});

window.addEventListener('load', () => {
    const solarSystem = document.querySelector('#solarSystem');
    solarSystem.setAttribute('solar-system', '');
});
