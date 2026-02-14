const FURNITURE_DATABASE = {
    table: { width: 1.2, height: 0.8, depth: 0.8, color: '#FF5733' },
    bed: { width: 1.4, height: 0.5, depth: 1.9, color: '#28B463' },
    wardrobe: { width: 1.0, height: 2.0, depth: 0.6, color: '#F1C40F' },
    chair: { width: 0.5, height: 1.0, depth: 0.5, color: '#3498DB' }
};

AFRAME.registerComponent('camera-zoom-fix', {
    init: function () {
        this.onCameraInit = this.triggerResize.bind(this);
        this.el.addEventListener('camera-init', this.onCameraInit);
    },
    triggerResize: function () {
        try {
            setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 500);
            const video = document.getElementById('arjs-video');
            if (video) video.style.objectFit = 'cover';
        } catch (error) {
            console.error('Camera fix error:', error.message);
        }
    },
    remove: function () {
        this.el.removeEventListener('camera-init', this.onCameraInit);
    }
});

AFRAME.registerComponent('ui-interaction-handler', {
    init: function () {
        this.uiContainer = document.getElementById('mindspace-ui');
        this.toggleBtn = document.getElementById('toggle-menu-btn');
        
        if (this.uiContainer && this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => {
                this.toggleMenu();
            });
        }
    },
    toggleMenu: function () {
        try {
            if (this.uiContainer.classList.contains('collapsed')) {
                this.uiContainer.classList.remove('collapsed');
                this.uiContainer.classList.add('expanded');
            } else {
                this.uiContainer.classList.remove('expanded');
                this.uiContainer.classList.add('collapsed');
            }
        } catch (error) {
            console.error('Menu toggle error:', error.message);
        }
    }
});

AFRAME.registerComponent('placement-lock', {
    init: function () {
        this.isLocked = false;
        this.sceneEl = document.querySelector('a-scene');
        this.markerEl = document.getElementById('main-marker');
        this.lockBtn = document.getElementById('lock-btn');
        
        this.onToggle = this.toggleLock.bind(this);
        this.lockBtn.addEventListener('click', this.onToggle);
    },
    toggleLock: function () {
        try {
            if (this.isLocked) {
                this.unlock();
            } else {
                this.lock();
            }
        } catch (error) {
            console.error('Lock toggle error:', error.message);
        }
    },
    lock: function () {
        if (!this.el.object3D || !this.sceneEl.object3D) return;

        this.sceneEl.object3D.attach(this.el.object3D);

        this.isLocked = true;
        this.lockBtn.innerText = 'Unlock';
        this.lockBtn.classList.add('locked');
    },
    unlock: function () {
        if (!this.el.object3D || !this.markerEl.object3D) return;

        this.markerEl.object3D.attach(this.el.object3D);
        
        this.el.object3D.position.set(0, 0, 0);
        this.el.object3D.rotation.set(0, 0, 0);
        
        this.isLocked = false;
        this.lockBtn.innerText = 'Lock';
        this.lockBtn.classList.remove('locked');
    }
});

AFRAME.registerComponent('mindspace-controller', {
    init: function () {
        try {
            this.ui = {
                selector: document.getElementById('furniture-selector'),
                scaleX: document.getElementById('scale-x'),
                scaleY: document.getElementById('scale-y'),
                scaleZ: document.getElementById('scale-z'),
                rotX: document.getElementById('rot-x'),
                rotY: document.getElementById('rot-y'),
                rotZ: document.getElementById('rot-z'),
                display: document.getElementById('measurement-display')
            };
            
            this.bindEvents();
            this.updateShape();
        } catch (error) {
            console.error('Controller init failed:', error.message);
        }
    },
    bindEvents: function () {
        this.ui.selector.addEventListener('change', () => { 
            this.updateShape(); 
            this.updateText(); 
        });
        
        const inputs = [
            this.ui.scaleX, this.ui.scaleY, this.ui.scaleZ, 
            this.ui.rotX, this.ui.rotY, this.ui.rotZ
        ];

        inputs.forEach(element => {
            element.addEventListener('input', () => { 
                this.updateTransform(); 
                this.updateText(); 
            });
        });
    },
    updateShape: function () {
        const type = this.ui.selector.value;
        const data = FURNITURE_DATABASE[type];
        
        this.el.setAttribute('geometry', {
            primitive: 'box',
            width: data.width,
            height: data.height,
            depth: data.depth
        });
        
        this.el.setAttribute('material', { color: data.color, opacity: 0.9 });
        
        this.el.object3D.position.y = data.height / 2;
    },
    updateTransform: function () {
        const sx = parseFloat(this.ui.scaleX.value);
        const sy = parseFloat(this.ui.scaleY.value);
        const sz = parseFloat(this.ui.scaleZ.value);
        
        const rx = parseFloat(this.ui.rotX.value);
        const ry = parseFloat(this.ui.rotY.value);
        const rz = parseFloat(this.ui.rotZ.value);

        this.el.object3D.scale.set(sx, sy, sz);
        
        this.el.object3D.rotation.set(
            THREE.Math.degToRad(rx),
            THREE.Math.degToRad(ry),
            THREE.Math.degToRad(rz)
        );
    },
    updateText: function () {
        const type = this.ui.selector.value;
        const data = FURNITURE_DATABASE[type];
        
        const w = (data.width * this.ui.scaleX.value).toFixed(2);
        const h = (data.height * this.ui.scaleY.value).toFixed(2);
        const d = (data.depth * this.ui.scaleZ.value).toFixed(2);

        this.ui.display.innerText = `W: ${w}m | H: ${h}m | D: ${d}m`;
    }
});