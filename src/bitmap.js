/**
 *
 * Bitmap
 *
 * @author D Lawson <webmaster@altovista.nl>
 */
canvaslib.Bitmap = function(imageObj) {
  canvaslib.DisplayContainer.call(this);

  this.imageData = imageObj ? imageObj : null;
  this.registrationPoint = {x: 0, y:0};
};

/**
 * Draws the image to the canvas
 */
canvaslib.Bitmap.prototype._draw = function(context, drawHitarea) {
    if(this.imageData) {
      // draw hit area
      if(drawHitarea) {
        context.rect(0, 0, this.imageData.width, this.imageData.height);
      } else {
        context.drawImage(this.imageData, 0, 0);
      }
    }
};

/**
 * Sets registration point
 */
canvaslib.Bitmap.prototype.setRegistrationPoint = function(x, y) {
    this.registrationPoint = {x: Math.round(x), y: Math.round(y)};
};

/**
 * Sets registration point
 */
canvaslib.Bitmap.prototype.centerRegistrationPoint = function() {
    this.setRegistrationPoint(this.imageData.width / 2, this.imageData.height / 2);
};

// inherit from display container
canvaslib.Utils.addOwnProperties(canvaslib.DisplayContainer.prototype, canvaslib.Bitmap.prototype);
