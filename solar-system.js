AFRAME.registerComponent('solar-system', {
    init: function() {
        this.earthOrbit = document.querySelector('#earthOrbit');
        this.moonOrbit = document.querySelector('#moonOrbit');
        this.sun = document.querySelector('#sun');
        
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
    
    tick: function(time, deltaTime) {
        // Earth orbit around Sun
        this.earthOrbit.object3D.rotation.y += 0.005;
        
        // Moon orbit around Earth
        this.moonOrbit.object3D.rotation.y += 0.015;
    }
});

window.addEventListener('load', () => {
    const solarSystem = document.querySelector('#solarSystem');
    solarSystem.setAttribute('solar-system', '');
});
