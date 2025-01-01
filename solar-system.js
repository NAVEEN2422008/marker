AFRAME.registerComponent('solar-system', {
    schema: {
        timeScale: {type: 'number', default: 1.0}
    },

    init: function() {
        this.setupConstants();
        this.setupElements();
        this.setupEventListeners();
    },

    setupConstants: function() {
        this.constants = {
            distances: {
                earth: 3,
                moon: 0.8
            },
            speeds: {
                sun: 0.001,
                earth: {
                    rotation: 0.015,
                    orbit: 0.005
                },
                moon: {
                    rotation: 0.02,
                    orbit: 0.015
                }
            }
        };
        this.isVisible = false;
    },

    setupElements: function() {
        this.elements = {};
        ['sun', 'earth', 'moon', 'earthOrbit', 'moonOrbit'].forEach(id => {
            const element = this.el.querySelector(`#${id}`);
            if (element) {
                this.elements[id] = element;
            } else {
                console.warn(`Missing element: ${id}`);
            }
        });
    },

    createOrbits: function() {
        // Create Earth's orbital path
        const earthPath = document.createElement('a-torus');
        earthPath.setAttribute('id', 'earthPath');
        earthPath.setAttribute('radius', this.constants.distances.earth);
        earthPath.setAttribute('radius-tubular', '0.02');
        earthPath.setAttribute('segments-tubular', '50');
        earthPath.setAttribute('rotation', '90 0 0');
        earthPath.setAttribute('material', 'color: #666; opacity: 0.5');
        this.el.appendChild(earthPath);
        
        // Create Moon's orbital path
        const moonPath = document.createElement('a-torus');
        moonPath.setAttribute('id', 'moonPath');
        moonPath.setAttribute('radius', this.constants.distances.moon);
        moonPath.setAttribute('radius-tubular', '0.01');
        moonPath.setAttribute('segments-tubular', '30');
        moonPath.setAttribute('rotation', '90 0 0');
        moonPath.setAttribute('material', 'color: #444; opacity: 0.3');
        this.elements.earthOrbit.appendChild(moonPath);
    },

    setupSystem: function() {
        // Sun setup
        if (this.elements.sun) {
            this.elements.sun.setAttribute('material', {
                src: 'https://cdn.glitch.global/your-assets/sun.jpg',
                emissive: '#FDB813',
                emissiveIntensity: 0.7,
                roughness: 1,
                metalness: 0
            });
            this.setScale('sun');
        }

        // Earth setup
        if (this.elements.earth) {
            this.elements.earth.setAttribute('material', {
                src: 'https://cdn.glitch.global/your-assets/earth.jpg',
                normalMap: 'https://cdn.glitch.global/your-assets/earth_normal.jpg',
                roughnessMap: 'https://cdn.glitch.global/your-assets/earth_rough.jpg',
                roughness: 0.8,
                metalness: 0.2
            });
            this.setScale('earth');
            this.elements.earth.object3D.position.set(this.constants.distances.earth, 0, 0);
        }

        // Moon setup
        if (this.elements.moon) {
            this.elements.moon.setAttribute('material', {
                src: 'https://cdn.glitch.global/your-assets/moon.jpg',
                normalMap: 'https://cdn.glitch.global/your-assets/moon_normal.jpg',
                roughness: 0.9,
                metalness: 0.1
            });
            this.setScale('moon');
            this.elements.moon.object3D.position.set(this.constants.distances.moon, 0, 0);
        }
    },

    setScale: function(bodyName) {
        const scale = this.constants.scales[bodyName];
        if (this.elements[bodyName] && scale) {
            this.elements[bodyName].object3D.scale.set(scale, scale, scale);
        }
    },

    setupEventListeners: function() {
        const marker = document.querySelector('#solarMarker');
        if (marker) {
            marker.addEventListener('markerFound', () => {
                this.isVisible = true;
                console.log('Solar system visible');
            });
            
            marker.addEventListener('markerLost', () => {
                this.isVisible = false;
                console.log('Solar system hidden');
            });
        }
    },

    tick: function(time, deltaTime) {
        if (!this.isVisible) return;

        const dt = deltaTime * 0.001 * this.data.timeScale;

        // Update rotations
        if (this.elements.sun) {
            this.elements.sun.object3D.rotation.y += this.constants.speeds.sun * dt;
        }

        if (this.elements.earth) {
            this.elements.earth.object3D.rotation.y += this.constants.speeds.earth.rotation * dt;
        }

        if (this.elements.earthOrbit) {
            this.elements.earthOrbit.object3D.rotation.y += this.constants.speeds.earth.orbit * dt;
        }

        if (this.elements.moonOrbit) {
            this.elements.moonOrbit.object3D.rotation.y += this.constants.speeds.moon.orbit * dt;
        }

        if (this.elements.moon) {
            this.elements.moon.object3D.rotation.y += this.constants.speeds.moon.rotation * dt;
        }
    }
});

window.addEventListener('load', () => {
    const solarSystem = document.querySelector('#solarSystem');
    solarSystem.setAttribute('solar-system', '');
});