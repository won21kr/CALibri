/*
 * CALibri - Canvas Animation Library
 * Released under BSD License.
 *
 * (c) 2010 Dimitri Fedorov <df@antistatic.net>
 * https://github.com/ai212983/CALibri
 *
 * Original code
 * (c) 2010 Diederick Lawson <webmaster@altovista.nl>
 * https://github.com/dkln/canvas_library
 *
 * @author DLawson
 * @author df
 */

/**
 * Main display container
 *
 * @author D Lawson <webmaster@altovista.nl>
 */

calibri.DisplayContainer = function(canvasId) {
    this.id = '';
    this.rotation = 0;
    this.x = 0;
    this.y = 0;
    this.alpha = 1;
    this.enabled = true;
    this.width = 0;
    this.height = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.children = [];
    this.visible = true;
    this.mouseEnabled = true;
    this.useHandCursor = false;
    this.shadow = false;
    this.shadowBlur = 0;
    this.shadowColor = 0;
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.onMouseOver = null;
    this.onMouseOut = null;
    this.onMouseDown = null;
    this.onMouseMove = null;
    this.localX = 0;
    this.localY = 0;

    this._oldX = 0;
    this._oldY = 0;
    this._oldRotation = 0;
    this._oldScaleX = 1;
    this._oldScaleY = 1;
    this._oldVisible = true;

    this._mouseX = 0;
    this._mouseY = 0;
    this._oldMouseX = 0;
    this._oldMouseY = 0;
    this._canvasX = 0;
    this._canvasY = 0;
    this._visible = true;
    this._rotation = 0;
    this._scaleX = 1;
    this._scaleY = 1;
    this._canvas = null;
    this._underCursor = false;
    this._lastObjectUnderCursor = null;
    this._backBufferCanvas = null;
    this._backBufferContext = null;
    this._context = null;
    this._parentDisplayContainer = null;
    this._superDisplayContainer = null;
    this._childrenChanged = false;
    this._allChildren = null;

    if(canvasId) {
        this._canvas = document.getElementById(canvasId);
        this._context = this._canvas.getContext('2d');

        this._backBufferCanvas = document.createElement('canvas');
        this._backBufferCanvas.width = this._canvas.width;
        this._backBufferCanvas.height = this._canvas.height;
        this._backBufferContext = this._backBufferCanvas.getContext('2d');
    }
};

calibri.DisplayContainer.prototype = {
    /**
     * Returns the parent displaycontainer
     */
    parentDisplayContainer: function() {
        return this._parentDisplayContainer;
    },

    /**
     * Find super parent object
     */
    superDisplayContainer: function() {
        // cache search of super display container
        if(this._parentDisplayContainer) {
          if(!this._superDisplayContainer)
            this._superDisplayContainer = this._findSuperDisplayContainer(this);

          return this._superDisplayContainer;
        } else {
          return this;
        }
    },

    /**
     * Tests if this object is the super
     */
    isSuperDisplayContainer: function() {
        return (this.superDisplayContainer() == this);
    },


    /**
     * Adds a given child to the displaylist of the object container
     */
    addChild: function(child) {
        this.superDisplayContainer()._childrenChanged = true;

        // is the object already a child of another display container? then remove it
        if(child._parentDisplayContainer)
            child._parentDisplayContainer.removeChild(child);

        // ok set new parent
        child._parentDisplayContainer = this;
        child._context = this.superDisplayContainer()._context;
        child._canvas = this.superDisplayContainer()._canvas;
        child._backBufferCanvas = this.superDisplayContainer()._backBufferCanvas;
        child._backBufferContext = this.superDisplayContainer()._backBufferContext;

        // add to displaylist
        this.children.push(child);

        return this;
    },

    /**
     * Sets Z-index of given child
     */
    setChildIndex: function(child, index) {
        if(this.children.indexOf(child) == -1) {
            throw "Child object not found in displaylist";
        } else {
            // @TODO implement me please!
            this.superDisplayContainer()._childrenChanged = true;
        }
    },

    /**
     * Removes the given child form the displaylist
     */
    removeChild: function(child) {
        var i = this.children.indexOf(child); // [0, 1, 2, 3, 4, 5, 6, 7]

        if (i == -1) {
            throw "Child object not found in displaylist";
        } else {
            this.superDisplayContainer()._childrenChanged = true;

            child._superDisplayContainer = null;
            child._parentDisplayContainer = null;
            child._canvas = null;
            child._context = null;
            child._backBufferCanvas = null;
            child._backBufferContext = null;

            this.children.splice(i, 1);

            return this;
        }
    },

    /**
     * Draws everyone
     */
    draw: function(clear) {
        if(this.isSuperDisplayContainer()) {
            this._drawAllChildren(clear);
            this._handleMouseEventsAllChildren();
        } else {
            this.superDisplayContainer().draw(clear);
        }
    },

    /**
     * Tests if the object's position has been changed
     */
    positionChanged: function() {
        return (  this.x != this._oldX || this.y != this._oldY ||
                  this.rotation != this._oldRotation ||
                  this.scaleX != this._oldScaleX || this.scaleY != this._oldScaleY ||
                  this.visible != this._oldVisible );
    },

    /**
     * Translates relative X, Y pos to canvas/world X, Y pos
     */
    _getInheritedTranslatedVars: function() {
        var translatedX = 0;
        var translatedY = 0;
        var translatedRotation = 0;
        var translatedScaleX = 1;
        var translatedScaleY = 1;
        var theParent = this;
        var visible = true;

        while(theParent != null) {
            translatedRotation += theParent.rotation;
            translatedScaleX *= theParent.scaleX;
            translatedScaleY *= theParent.scaleY;
            // actually, if parental scale is not 1, you can't calculate translatedX just by adding theParent.x
            //TODO: Implement proper coordinates translation when scaled
            translatedX += theParent.x;
            translatedY += theParent.y;
            if(!theParent.visible)
                visible = false;
          theParent = theParent._parentDisplayContainer;
        }
        return [translatedX, translatedY, translatedRotation, translatedScaleX, translatedScaleY, visible];
    },

    /**
     * Translated relative X, Y pos to canvas/world X, Y pos
     */
    _setCanvasPosition: function() {

        if (!this.positionChanged())
            return; // premature exit

        var newVars = this._getInheritedTranslatedVars();

        this._oldX = this.x;
        this._oldY = this.y;
        this._oldRotation = this.rotation;
        this._oldScaleX = this.scaleX;
        this._oldScaleY = this.scaleY;

        this._canvasX = newVars[0];
        this._canvasY = newVars[1];
        this._rotation = newVars[2];
        this._scaleX = newVars[3];
        this._scaleY = newVars[4];
        this._visible = newVars[5];
    },

    /**
     * Draws all objects
     */
    _drawAllChildren: function(clear) {
        if (!this.isSuperDisplayContainer()){
            this.superDisplayContainer()._drawAllChildren(clear);
            return; // premature exit
        }

        var i;

        if (clear)
            this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

        // retrieve ALL children
        if (this._childrenChanged) {
            this._allChildren = this._getAllChildren();
            this._childrenChanged = false;
        }

        // loop all children
        for (i = 0; i < this._allChildren.length; i++) {
            // translate X, Y pos
            this._allChildren[i]._setCanvasPosition();
            if (this._allChildren[i]._visible) {
                // draw on surface
                // save context
                this._context.save();
                // setup context
                this._setupContext(this._context, this._allChildren[i]);

                // go draw!
                this._allChildren[i]._draw(this._context);

                // restore context
                this._context.restore();
            }
        }
    },

    /**
     * Fires all appropriate mouse events for every display obj
     */
    _handleMouseEventsAllChildren: function() {

        if(!this.isSuperDisplayContainer()) {
            this.superDisplayContainer()._handleMouseEventsAllChildren();
            return; // premature exit
        }

        var i = 0;
        var objectUnderCursor = null;
        var obj = null;

        // loop all children
        for (i = this._allChildren.length - 1; i >= 0; i--) {
            obj = this._allChildren[i];

            if (obj._visible && obj.mouseEnabled) {
                // draw on backbuffer for collision detection
                this._backBufferContext.clearRect(0, 0, this._canvas.width, this._canvas.height);
                this._backBufferContext.save();
                this._setupContext(this._backBufferContext, obj);
                this._backBufferContext.beginPath();

                obj._draw(this._backBufferContext, true);

                // set local mouse X and Y
                obj.localX = this._mouseX - this._canvasX;
                obj.localY = this._mouseY - this._canvasY;

                // did the mouse hit an object?
                if(this._backBufferContext.isPointInPath(this._mouseX, this._mouseY)) {
                    this._backBufferContext.restore();
                    // yes we did, yer!
                    objectUnderCursor = obj;
                    break;
                }
                this._backBufferContext.restore();
            }
        }

        // is the current object than the lost object that hit the mouse?
        if (this._lastObjectUnderCursor != objectUnderCursor) {
            // call mouseout event
            if (this._lastObjectUnderCursor) {
                if (this._lastObjectUnderCursor.onMouseOut)
                    this._lastObjectUnderCursor.onMouseOut();

                // hide hand cursor
                if (this._lastObjectUnderCursor.useHandCursor)
                    this._setHandCursor(false);
            }
            if(objectUnderCursor) {
                // call handler?
                if(objectUnderCursor.onMouseOver)
                    objectUnderCursor.onMouseOver();

                // show hand cursor?
                if(objectUnderCursor.useHandCursor)
                    this._setHandCursor(true);
            }

        // do we have to fire an mouse move event?
        } else if(objectUnderCursor && (this._oldMouseX != this._mouseX || this._oldMouseY != this._mouseY) && objectUnderCursor.onMouseMove) {
            objectUnderCursor.onMouseMove();
        }

        // remember last object
        this._lastObjectUnderCursor = objectUnderCursor;
    },

    _setHandCursor: function(showHand) {
        if(showHand) {
            this._canvas.style.cursor = 'pointer';
        } else {
            this._canvas.style.cursor = '';
        }
    },

    /**
     * Retrieves all children in the tree
     */
    _getAllChildren: function(onlyVisibles) {
        var children = [];
        if(this.isSuperDisplayContainer()) {
            this._getChildren(this, children, onlyVisibles);
            return children;
        } else {
            return this.superDisplayContainer()._getAllChildren();
        }
    },

    /**
     * Retrieves ALL children from given parent and it's sub-children
     */
    _getChildren: function(fromParent, collectedChildren, onlyVisibles) {
        var i = 0;

        for(i = 0; i < fromParent.children.length; i++) {
            if(!onlyVisibles || (onlyVisibles && fromParent.children[i].visible))
                collectedChildren.push(fromParent.children[i]);

            if((!onlyVisibles || (onlyVisibles && fromParent.children[i].visible)) && fromParent.children[i].children && fromParent.children[i].children.length > 0)
                this._getChildren(fromParent.children[i], collectedChildren, onlyVisibles);
        }
    },

    _draw: function(context, drawHitarea) {
        // you could implement this...
    },

    // privates
    _findSuperDisplayContainer: function(parent) {
        if(parent._parentDisplayContainer)
            return this._findSuperDisplayContainer(parent._parentDisplayContainer);
        else
            return parent;
    },

    /**
     * Set's up global mouse event listener
     */
    _setupMouse: function() {
        var self = this;

        this._canvas.mouseover = true;
        this._canvas.addEventListener('mousemove', function(event) {
            var _super = self.superDisplayContainer();

            _super._mouseX = event.clientX - self._canvas.offsetLeft;
            _super._mouseY = event.clientY - self._canvas.offsetTop;
            _super.localX = _super._mouseX;
            _super.localY = _super._mouseY;

            if(_super.onMouseMove)
                _super.onMouseMove();
        }, false);
    },

    /**
     * Sets up context for drawing
     */
    _setupContext: function(context, displayObj) {
        // sets mouse over events if not present yet
        if(!this._canvas.mouseover)
            this._setupMouse();

        // sets the alpha of the image
        context.globalAlpha = displayObj.alpha;
        var x = displayObj._canvasX;
        var y = displayObj._canvasY;
        if (displayObj.registrationPoint) {
            x -= displayObj.registrationPoint.x;
            y -= displayObj.registrationPoint.y;
        }
        context.translate(x, y);
        context.rotate(calibri.Math.angleToRadians(displayObj._rotation));
        context.scale(displayObj._scaleX, displayObj._scaleY);

        // add shadow?
        if(displayObj.shadow) {
            context.shadowBlur = displayObj.shadowBlur;
            context.shadowColor = displayObj.shadowColor;
            context.shadowOffsetX = displayObj.shadowOffsetX;
            context.shadowOffsetY = displayObj.shadowOffsetY;
        }
    }
};
