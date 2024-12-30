AFRAME.registerComponent('solar-system', {
    schema: {
        timeScale: {type: 'number', default: 1},
        realScale: {type: 'boolean', default: false},
        smoothTransitions: {type: 'boolean', default: true}
    },

    init: function() {
        // Cache references and bind methods
        this.onMarkerFound = this.onMarkerFound.bind(this);
        this.onMarkerLost = this.onMarkerLost.bind(this);
        this.onMarkerStabilized = this.onMarkerStabilized.bind(this);
        
        this.state = {
            isVisible: false,
            isStable: false,
            lastUpdate: 0
        };

        try {
            this.initializeCelestialBodies();
            this.setupSystem();
            this.addEventListeners();
        } catch (error) {
            console.error('Solar system initialization failed:', error);
            this.handleError(error);
        }
    },

    initializeCelestialBodies: function() {
        // Cache elements with error checking
        const bodies = ['sun', 'earth', 'moon', 'earthOrbit', 'moonOrbit'];
        this.celestialBodies = {};
        
        bodies.forEach(id => {
            const element = this.el.querySelector(`#${id}`);
            if (!element) {
                throw new Error(`Required element #${id} not found`);
            }
            this.celestialBodies[id] = element;
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
        
        // Add smooth easing for transitions
        const animation = {
            property: 'rotation',
            to: '0 360 0',
            dur: duration,
            easing: this.data.smoothTransitions ? 'easeOutQuad' : 'linear',
            loop: true
        };

        body.setAttribute('animation__rotate', animation);
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
        
        marker.addEventListener('markerFound', this.onMarkerFound);
        marker.addEventListener('markerLost', this.onMarkerLost);
        this.el.sceneEl.addEventListener('marker-stabilized', this.onMarkerStabilized);
    },

    onMarkerFound: function() {
        this.state.isVisible = true;
        this.el.emit('solar-system-visible', {});
        this.resumeAnimations();
    },

    onMarkerLost: function() {
        this.state.isVisible = false;
        this.el.emit('solar-system-hidden', {});
        this.pauseAnimations();
    },

    onMarkerStabilized: function() {
        if (!this.state.isStable) {
            this.state.isStable = true;
            
            // Smooth scale-up animation
            Object.values(this.celestialBodies).forEach(body => {
                const currentScale = body.getAttribute('scale');
                body.setAttribute('animation__appear', {
                    property: 'scale',
                    from: '0 0 0',
                    to: `${currentScale.x} ${currentScale.y} ${currentScale.z}`,
                    dur: 1000,
                    easing: 'easeOutElastic'
                });
            });
        }
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
        if (!this.state.isVisible || !this.celestialBodies.earthOrbit.object3D.visible) return;

        // Limit updates to max 60fps
        if (time - this.state.lastUpdate < 16) return;
        this.state.lastUpdate = time;

        try {
            const scaledTime = time * this.data.timeScale;
            this.updateOrbits(scaledTime);
        } catch (error) {
            console.error('Error in tick:', error);
        }
    },

    updateOrbits: function(scaledTime) {
        // Calculate orbital positions
        const earthRotation = (scaledTime / (this.constants.earthYear * 1000)) * 2 * Math.PI;
        const moonRotation = (scaledTime / (this.constants.moonMonth * 1000)) * 2 * Math.PI;

        // Apply smooth interpolation
        this.celestialBodies.earthOrbit.object3D.rotation.y = 
            THREE.MathUtils.lerp(
                this.celestialBodies.earthOrbit.object3D.rotation.y,
                earthRotation,
                0.1
            );

        this.celestialBodies.moonOrbit.object3D.rotation.y = 
            THREE.MathUtils.lerp(
                this.celestialBodies.moonOrbit.object3D.rotation.y,
                moonRotation,
                0.1
            );
    },

    handleError: function(error) {
        // Emit error event for UI handling
        this.el.emit('solar-system-error', {
            message: error.message,
            details: error
        });
    },

    remove: function() {
        // Proper cleanup
        this.removeEventListeners();
        this.pauseAnimations();
        
        Object.values(this.celestialBodies).forEach(body => {
            if (body.parentNode) {
                body.parentNode.removeChild(body);
            }
        });
    },

    removeEventListeners: function() {
        const marker = document.querySelector('a-marker');
        
        marker.removeEventListener('markerFound', this.onMarkerFound);
        marker.removeEventListener('markerLost', this.onMarkerLost);
        this.el.sceneEl.removeEventListener('marker-stabilized', this.onMarkerStabilized);
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
