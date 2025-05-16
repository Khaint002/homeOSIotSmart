//
// avoid calling "L.Mixin.Events.addEventListener" by registering events that are not used
//

L.FeatureGroup.EVENTS = '';

//
// avoid calling L.Util.extend and setting default styles on each element 
//

// set default styles on the svg root element right after it's initialized
L.Map.include({
    _initPathRootOrig: L.Map.prototype._initPathRoot,
    _initPathRoot: function () {
        var init = !this._pathRoot;
        
        this._initPathRootOrig();
        
        if (init) {
            this._pathRoot.setAttribute("stroke", "#29439c");
            this._pathRoot.setAttribute('fill', 'none');
            this._pathRoot.setAttribute("stroke-opacity", 1.0);
        }
    }
});

L.Path.include({
    // clear default options, not used, see initialize
    options: {},
    
    initialize: function (options) {
        // overwrite default options to avoid calling L.Util.extend (L.setOptions)
        this.options = options || {};

        this.options.clickable = false;
        this.options.zoomAnimation = false;
    },

    _initStyle: function () {
        // no default styles

        this._updateStyle();
    },

    _updateStyle: function () {
        // only set styles needed
        if (this.options.weight) {
            this._path.setAttribute('stroke-width', this.options.weight);
        }
        if (this.options.color) {
            this._path.setAttribute('stroke', this.options.color);
        }
    }
});

// --------------------------------------------------------------------------
// L.TileLayer.GeoJSON

//
// avoid "Recalculate Style" while adding svg elements
//
var _tilesLoaded = L.TileLayer.GeoJSON.prototype._tilesLoaded;
L.TileLayer.GeoJSON.prototype._tilesLoaded = function(evt) {
    console.profile('addData');
    console.time('addData');

    // remove svg root from DOM while adding elements to it
    this._map._panes.overlayPane.removeChild(this._map._pathRoot);

    _tilesLoaded.apply(this, arguments);
    
    this._map._panes.overlayPane.appendChild(this._map._pathRoot);
    
    console.timeEnd('addData');
    console.profileEnd();
}