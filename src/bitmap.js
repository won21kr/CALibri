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
calibri.Bitmap = function(imageObj) {
  calibri.DisplayContainer.call(this);

  this.imageData = imageObj ? imageObj : null;
  this.registrationPoint = {x: 0, y:0};
};

/**
 * Draws the image to the canvas
 */
calibri.Bitmap.prototype._draw = function(context, drawHitarea) {
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
calibri.Bitmap.prototype.setRegistrationPoint = function(x, y) {
    this.registrationPoint = {x: Math.round(x), y: Math.round(y)};
};

/**
 * Sets registration point
 */
calibri.Bitmap.prototype.centerRegistrationPoint = function() {
    this.setRegistrationPoint(this.imageData.width / 2, this.imageData.height / 2);
};

// inherit from display container
calibri.Utils.addOwnProperties(calibri.DisplayContainer.prototype, calibri.Bitmap.prototype);
