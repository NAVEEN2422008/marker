AFRAME.registerComponent('solar-system', {
    schema: {
        timeScale: {type: 'number', default: 1.0}
    },

    init: function() {
        this.setupConstants();
        this.setupElements();
        this.createOrbits();
        this.setupEventListeners();
    },

    setupElements: function() {
        this.celestialBodies = {};
        ['sun', 'earth', 'moon', 'earthOrbit', 'moonOrbit'].forEach(id => {
            const element = this.el.querySelector(`#${id}`);
            if (element) {
                this.celestialBodies[id] = element;
            }
        });
    },

    setupConstants: function() {
        this.constants = {
            earthDistance: 2,
            moonDistance: 0.8,
            scales: {
                sun: 0.8,
                earth: 0.4,
                moon: 0.15
            },
            speeds: {
                earthRotation: 0.01,
                earthOrbit: 0.005,
                moonRotation: 0.01,
                moonOrbit: 0.02,
                sunRotation: 0.001
            }
        };
        this.isVisible = false;
    },

    createOrbits: function() {
        // Create Earth's orbital path
        const earthPath = document.createElement('a-torus');
        earthPath.setAttribute('id', 'earthPath');
        earthPath.setAttribute('radius', this.constants.earthDistance);
        earthPath.setAttribute('radius-tubular', '0.02');
        earthPath.setAttribute('segments-tubular', '50');
        earthPath.setAttribute('rotation', '90 0 0');
        earthPath.setAttribute('material', 'color: #666; opacity: 0.5');
        this.el.appendChild(earthPath);
        
        // Create Moon's orbital path
        const moonPath = document.createElement('a-torus');
        moonPath.setAttribute('id', 'moonPath');
        moonPath.setAttribute('radius', this.constants.moonDistance);
        moonPath.setAttribute('radius-tubular', '0.01');
        moonPath.setAttribute('segments-tubular', '30');
        moonPath.setAttribute('rotation', '90 0 0');
        moonPath.setAttribute('material', 'color: #444; opacity: 0.3');
        this.celestialBodies.earthOrbit.appendChild(moonPath);
    },

    setupSystem: function() {
        // Sun setup
        if (this.celestialBodies.sun) {
            this.celestialBodies.sun.setAttribute('material', {
                src: 'https://cdn.glitch.global/your-assets/sun.jpg',
                emissive: '#FDB813',
                emissiveIntensity: 0.7,
                roughness: 1,
                metalness: 0
            });
            this.setScale('sun');
        }

        // Earth setup
        if (this.celestialBodies.earth) {
            this.celestialBodies.earth.setAttribute('material', {
                src: 'https://cdn.glitch.global/your-assets/earth.jpg',
                normalMap: 'https://cdn.glitch.global/your-assets/earth_normal.jpg',
                roughnessMap: 'https://cdn.glitch.global/your-assets/earth_rough.jpg',
                roughness: 0.8,
                metalness: 0.2
            });
            this.setScale('earth');
            this.celestialBodies.earth.object3D.position.set(this.constants.earthDistance, 0, 0);
        }

        // Moon setup
        if (this.celestialBodies.moon) {
            this.celestialBodies.moon.setAttribute('material', {
                src: 'https://cdn.glitch.global/your-assets/moon.jpg',
                normalMap: 'https://cdn.glitch.global/your-assets/moon_normal.jpg',
                roughness: 0.9,
                metalness: 0.1
            });
            this.setScale('moon');
            this.celestialBodies.moon.object3D.position.set(this.constants.moonDistance, 0, 0);
        }
    },

    setScale: function(bodyName) {
        const scale = this.constants.scales[bodyName];
        if (this.celestialBodies[bodyName] && scale) {
            this.celestialBodies[bodyName].object3D.scale.set(scale, scale, scale);
        }
    },

    setupEventListeners: function() {
        const marker = document.querySelector('#solarMarker');
        if (marker) {
            marker.addEventListener('markerFound', () => {
                this.isVisible = true;
                this.el.emit('solar-system-visible');
            });
            
            marker.addEventListener('markerLost', () => {
                this.isVisible = false;
                this.el.emit('solar-system-hidden');
            });
        }
    },

    tick: function(time, deltaTime) {
        if (!this.isVisible) return;

        const dt = deltaTime * 0.001 * this.data.timeScale;

        // Rotate sun
        if (this.celestialBodies.sun) {
            this.celestialBodies.sun.object3D.rotation.y += this.constants.speeds.sunRotation * dt;
        }

        // Rotate and orbit Earth
        if (this.celestialBodies.earthOrbit) {
            this.celestialBodies.earthOrbit.object3D.rotation.y += this.constants.speeds.earthOrbit * dt;
        }
        if (this.celestialBodies.earth) {
            this.celestialBodies.earth.object3D.rotation.y += this.constants.speeds.earthRotation * dt;
        }

        // Rotate and orbit Moon
        if (this.celestialBodies.moonOrbit) {
            this.celestialBodies.moonOrbit.object3D.rotation.y += this.constants.speeds.moonOrbit * dt;
        }
        if (this.celestialBodies.moon) {
            this.celestialBodies.moon.object3D.rotation.y += this.constants.speeds.moonRotation * dt;
        }
    }
});

window.addEventListener('load', () => {
    const solarSystem = document.querySelector('#solarSystem');
    solarSystem.setAttribute('solar-system', '');
});
