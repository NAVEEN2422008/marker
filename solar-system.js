AFRAME.registerComponent('solar-system', {
    schema: {
        timeScale: {type: 'number', default: 1}
    },

    init: function() {
        this.sun = this.el.querySelector('#sun');
        this.earth = this.el.querySelector('#earth');
        this.moon = this.el.querySelector('#moon');
        this.earthOrbit = this.el.querySelector('#earthOrbit');
        this.moonOrbit = this.el.querySelector('#moonOrbit');
        
        // Real astronomical values (scaled)
        this.earthYear = 365.25; // days
        this.earthDay = 24; // hours
        this.moonMonth = 27.3; // days
        this.sunRotation = 27; // days
        
        this.setupOrbits();
        this.setupLighting();
        
        // Add marker detection
        const marker = document.querySelector('a-marker');
        const markerInfo = document.querySelector('#markerInfo');
        
        marker.addEventListener('markerFound', () => {
            markerInfo.textContent = 'Solar System Marker Detected! 🌟';
            console.log('Marker found');
        });
        
        marker.addEventListener('markerLost', () => {
            markerInfo.textContent = 'Looking for marker...';
            console.log('Marker lost');
        });
    },

    setupOrbits: function() {
        // Earth orbit
        this.earthOrbit.object3D.rotation.x = THREE.MathUtils.degToRad(23.5); // Earth's tilt
        
        // Moon orbit
        this.moonOrbit.object3D.rotation.x = THREE.MathUtils.degToRad(5.14); // Moon's orbital tilt
    },

    setupLighting: function() {
        // Sun's light
        const sunLight = new THREE.PointLight(0xFDB813, 2, 100);
        this.sun.object3D.add(sunLight);
    },

    tick: function(time, deltaTime) {
        const scaledTime = time * this.data.timeScale;
        
        // Earth rotation and orbit
        this.earthOrbit.object3D.rotation.y = (scaledTime / (this.earthYear * 1000)) * 2 * Math.PI;
        this.earth.object3D.rotation.y = (scaledTime / (this.earthDay * 1000)) * 2 * Math.PI;
        
        // Moon orbit
        this.moonOrbit.object3D.rotation.y = (scaledTime / (this.moonMonth * 1000)) * 2 * Math.PI;
        
        // Sun rotation
        this.sun.object3D.rotation.y = (scaledTime / (this.sunRotation * 1000)) * 2 * Math.PI;
    }
});

window.addEventListener('load', () => {
    const solarSystem = document.querySelector('#solarSystem');
    solarSystem.setAttribute('solar-system', '');
});
