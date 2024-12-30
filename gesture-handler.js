AFRAME.registerComponent('gesture-handler', {
    schema: {
        minScale: { type: 'number', default: 0.1 },
        maxScale: { type: 'number', default: 20 },
        scaleStep: { type: 'number', default: 0.05 }
    },

    init: function() {
        this.initialScale = this.el.object3D.scale.clone();
        this.scaleFactor = 1;
        this.handleGestures();
    },

    handleGestures: function() {
        const el = this.el;
        const hammer = new Hammer(document.body);

        hammer.get('pinch').set({ enable: true });

        hammer.on('pinchstart', () => {
            this.initialScale = el.object3D.scale.clone();
        });

        hammer.on('pinch', (ev) => {
            const scale = Math.min(
                Math.max(
                    this.initialScale.x * ev.scale,
                    this.data.minScale
                ),
                this.data.maxScale
            );

            el.object3D.scale.set(scale, scale, scale);
        });

        // Add double tap to reset
        hammer.on('doubletap', () => {
            el.object3D.scale.set(0.15, 0.15, 0.15); // Reset to original scale
        });
    }
});