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
 * Textfield
 *
 * @author D Lawson <webmaster@altovista.nl>
 */
calibri.TextField = function() {
  calibri.DisplayContainer.call(this);
  this.text = '';
  this.textAlign = 'left';
  this.strokeStyle = '';
  this.fillStyle = 'rgba(0,0,0,1)';
  this.font = '20pt Arial';
  this.maxWidth = null;
};

calibri.TextField.prototype = {
  _draw: function(context, drawHitarea) {
    context.font = this.font;

    if(this.strokeStyle != '')
      context.strokeStyle = this.strokeStyle;

    if(this.fillStyle != '')
      context.fillStyle = this.fillStyle;

    context.fillText(this.text, 0, 0);//, this.maxWidth);
  }
};

calibri.Utils.addOwnProperties(calibri.DisplayContainer.prototype, calibri.TextField.prototype);
