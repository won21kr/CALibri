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
 * Renderer
 *
 * @author D Lawson <webmaster@altovista.nl>
 */
function Renderer(mainContainer) {
  this._timer = null;
  this._running = false;
  this._frameHandlers = null;
  this._mainContainer = mainContainer;
}

/**
 * Sets the frames per second
  */
Renderer.prototype.setFps = function(fps) {
    this._interval = 1000 / fps;
};
  
/**
 * Runs the render engine
 */
Renderer.prototype.run = function(fps) {
    if(fps) this.setFps(fps);
    if(this._running) this.stop();
    this._running = true;
    this._timer = setInterval(this.handleInterval, this._interval, this);
};
  
/**
 * Add a frame handler that is called every frame draw
 */
Renderer.prototype.addFrameHandler = function(handler) {
    // create array (if we don't already have one)
    if(!this._frameHandlers) this._frameHandlers = [];
    
    // check if handler already exists
    if(this._frameHandlers.indexOf(handler) == -1)
        this._frameHandlers.push(handler);
};
  
/**
 * Is called every frame. Calls the onEnterFrame handler is there is one defined
 */
Renderer.prototype.handleInterval = function(self) {
    var i = 0;    
    
    // call frame handlers (if we have one)
    if(self._frameHandlers)
        for(i = 0; i < self._frameHandlers.length; i++) self._frameHandlers[i]();
    
    // update tweening objects
    calibri.Tween.update();
    
    // draw everything to canvas
    self._mainContainer.draw(true);
};
  
/**
 * Stops the renderer
 */
Renderer.prototype.stop = function() {
    clearInterval(this._timer);
    this._running = false;    
    this._timer = null;
};

calibri.Renderer = Renderer;