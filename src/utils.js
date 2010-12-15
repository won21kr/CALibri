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

calibri.Utils = {
  addOwnProperties: function(from, to) {
    for(var property in from) {
      if(!to.hasOwnProperty(property))
        to[property] = from[property];
    }
  },
  
  bind: function(self, funct) {
    var context = self;

    return function() {
      return funct.apply(context, arguments);
    };
  }
};