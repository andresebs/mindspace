// Defines base dimensions (in meters) and colors for each furniture type
const FURNITURE_DATABASE = {
    table: { width: 1.2, height: 0.8, depth: 0.8, color: '#FF5733' },
    bed: { width: 1.4, height: 0.5, depth: 1.9, color: '#28B463' },
    wardrobe: { width: 1.0, height: 2.0, depth: 0.6, color: '#F1C40F' },
    chair: { width: 0.5, height: 1.0, depth: 0.5, color: '#3498DB' }
};

AFRAME.registerComponent('camera-zoom-fix', {
    init: function () {
        this.handleCameraInitialization = this.forceResizeCalculation.bind(this);
        this.el.addEventListener('camera-init', this.handleCameraInitialization);
    },

    forceResizeCalculation: function () {
        try {
            setTimeout(function () {
                window.dispatchEvent(new Event('resize'));
            }, 500);
            this.applyVideoStyles();
        } catch (error) {
            console.error('Error triggering camera resize fix: ', error.message);
        }
    },

    applyVideoStyles: function () {
        try {
            const videoElement = document.getElementById('arjs-video');
            if (!videoElement) {
                throw new Error('AR.js video element not found.');
            }
            videoElement.style.objectFit = 'cover';
        } catch (error) {
            console.error('Failed to apply video styles: ', error.message);
        }
    },

    remove: function () {
        this.el.removeEventListener('camera-init', this.handleCameraInitialization);
    }
});

AFRAME.registerComponent('mindspace-controller', {
    init: function () {
        try {
            this.bindDOMReferences();
            this.attachEventListeners();
            this.updateModelGeometry();
            this.updateModelTransform();
        } catch (error) {
            console.error('Failed to initialize mindspace-controller: ', error.message);
        }
    },

    bindDOMReferences: function () {
        this.uiElements = {
            selector: document.getElementById('furniture-selector'),
            scaleX: document.getElementById('scale-x'),
            scaleY: document.getElementById('scale-y'),
            scaleZ: document.getElementById('scale-z'),
            rotX: document.getElementById('rot-x'),
            rotY: document.getElementById('rot-y'),
            rotZ: document.getElementById('rot-z'),
            measurements: document.getElementById('measurement-display')
        };

        if (!this.uiElements.selector || !this.uiElements.measurements) {
            throw new Error('Critical UI elements are missing from the DOM.');
        }
    },

    attachEventListeners: function () {
        this.uiElements.selector.addEventListener('change', this.handleFurnitureChange.bind(this));
        
        const scaleInputs = [this.uiElements.scaleX, this.uiElements.scaleY, this.uiElements.scaleZ];
        scaleInputs.forEach(input => {
            input.addEventListener('input', this.handleTransformChange.bind(this));
        });

        const rotInputs = [this.uiElements.rotX, this.uiElements.rotY, this.uiElements.rotZ];
        rotInputs.forEach(input => {
            input.addEventListener('input', this.handleTransformChange.bind(this));
        });
    },

    handleFurnitureChange: function () {
        try {
            this.updateModelGeometry();
            this.updateCalculatedMeasurements();
        } catch (error) {
            console.error('Error changing furniture type: ', error.message);
        }
    },

    handleTransformChange: function () {
        try {
            this.updateModelTransform();
            this.updateCalculatedMeasurements();
        } catch (error) {
            console.error('Error updating transformation: ', error.message);
        }
    },

    updateModelGeometry: function () {
        const selectedType = this.uiElements.selector.value;
        const furnitureData = FURNITURE_DATABASE[selectedType];

        if (!furnitureData) {
            throw new Error('Invalid furniture type selected.');
        }

        this.el.setAttribute('geometry', {
            primitive: 'box',
            width: furnitureData.width,
            height: furnitureData.height,
            depth: furnitureData.depth
        });

        this.el.setAttribute('material', {
            color: furnitureData.color,
            opacity: 0.8
        });

        const yOffset = furnitureData.height / 2;
        this.el.setAttribute('position', '0 ' + yOffset + ' 0');
    },

    updateModelTransform: function () {
        const scaleValues = {
            x: parseFloat(this.uiElements.scaleX.value),
            y: parseFloat(this.uiElements.scaleY.value),
            z: parseFloat(this.uiElements.scaleZ.value)
        };

        const rotationValues = {
            x: parseFloat(this.uiElements.rotX.value),
            y: parseFloat(this.uiElements.rotY.value),
            z: parseFloat(this.uiElements.rotZ.value)
        };

        this.el.setAttribute('scale', scaleValues);
        this.el.setAttribute('rotation', rotationValues);
    },

    updateCalculatedMeasurements: function () {
        const selectedType = this.uiElements.selector.value;
        const baseData = FURNITURE_DATABASE[selectedType];

        const finalWidth = (baseData.width * parseFloat(this.uiElements.scaleX.value)).toFixed(2);
        const finalHeight = (baseData.height * parseFloat(this.uiElements.scaleY.value)).toFixed(2);
        const finalDepth = (baseData.depth * parseFloat(this.uiElements.scaleZ.value)).toFixed(2);

        this.uiElements.measurements.innerText = 
            'Width: ' + finalWidth + 'm | ' +
            'Height: ' + finalHeight + 'm | ' +
            'Depth: ' + finalDepth + 'm';
    }
});