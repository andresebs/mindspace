// Defines a component to dynamically generate dimension labels for furniture
AFRAME.registerComponent('dimension-display', {
    schema: {
        itemName: { type: 'string', default: 'Furniture' },
        width: { type: 'number', default: 1.0 },
        height: { type: 'number', default: 1.0 },
        depth: { type: 'number', default: 1.0 }
    },

    init: function () {
        this.createMeasurementLabel();
    },

    createMeasurementLabel: function () {
        try {
            if (!this.el) {
                throw new Error('Parent entity missing for dimension-display component.');
            }

            const textEntity = document.createElement('a-text');
            const labelText = this.data.itemName + '\n' + 
                              'W: ' + this.data.width + 'm\n' +
                              'H: ' + this.data.height + 'm\n' +
                              'D: ' + this.data.depth + 'm';

            textEntity.setAttribute('value', labelText);
            
            // Positions the text slightly above the furniture object
            const yPosition = (this.data.height / 2) + 0.3;
            textEntity.setAttribute('position', '0 ' + yPosition + ' 0');
            
            textEntity.setAttribute('align', 'center');
            textEntity.setAttribute('color', '#000000');
            textEntity.setAttribute('scale', '0.6 0.6 0.6');

            this.el.appendChild(textEntity);
        } catch (error) {
            console.error('Failed to initialize measurement label: ', error.message);
        }
    }
});