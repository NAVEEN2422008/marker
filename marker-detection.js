AFRAME.registerComponent('better-marker-detection', {
    schema: {
        stabilityThreshold: {type: 'number', default: 5},
        stabilityTimeout: {type: 'number', default: 100}
    },

    init: function() {
        this.state = {
            lastVisible: false,
            visibilityCount: 0,
            lastCheck: 0,
            isStable: false
        };

        this.setupEventListeners();
    },

    setupEventListeners: function() {
        this.el.addEventListener('markerFound', () => {
            this.el.setAttribute('visible', 'true');
            document.querySelector('#solarSystem').emit('marker-found');
            document.body.classList.add('marker-found');
        });

        this.el.addEventListener('markerLost', () => {
            this.el.setAttribute('visible', 'false');
            document.querySelector('#solarSystem').emit('marker-lost');
            document.body.classList.remove('marker-found');
            this.resetStability();
        });
    },

    tick: function(time) {
        if (time - this.state.lastCheck < this.data.stabilityTimeout) return;
        this.state.lastCheck = time;

        const visible = this.el.object3D.visible;
        
        if (visible === this.state.lastVisible) {
            this.state.visibilityCount++;
            if (this.state.visibilityCount >= this.data.stabilityThreshold && !this.state.isStable) {
                this.state.isStable = true;
                this.el.emit('marker-stabilized');
                document.body.classList.add('marker-stable');
            }
        } else {
            this.resetStability();
        }

        this.state.lastVisible = visible;
    },

    resetStability: function() {
        this.state.visibilityCount = 0;
        this.state.isStable = false;
        document.body.classList.remove('marker-stable');
    }
});