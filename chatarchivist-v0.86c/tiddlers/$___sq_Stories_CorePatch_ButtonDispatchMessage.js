var ButtonWidget = require("$:/core/modules/widgets/button.js").button;

ButtonWidget.prototype.dispatchMessage = function(event) {
	this.dispatchEvent({type: this.message, param: this.param, tiddlerTitle: this.getVariable("currentTiddler"), event: event, navigateFromNode: this});
};