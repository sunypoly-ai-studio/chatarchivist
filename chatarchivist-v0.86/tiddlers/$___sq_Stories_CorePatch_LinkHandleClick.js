var LinkWidget = require("$:/core/modules/widgets/link.js").link;

LinkWidget.prototype.sq_handleClickEvent = LinkWidget.prototype.handleClickEvent;

LinkWidget.prototype.handleClickEvent = function(event) {
	// Send the click on its way as a navigate event
	var bounds = this.domNodes[0].getBoundingClientRect();
	this.dispatchEvent({
		type: "tm-navigate",
		navigateTo: this.to,
		navigateFromTitle: this.getVariable("storyTiddler"),
		navigateFromNode: this,
		navigateFromClientRect: { top: bounds.top, left: bounds.left, width: bounds.width, right: bounds.right, bottom: bounds.bottom, height: bounds.height
		},
		navigateSuppressNavigation: event.metaKey || event.ctrlKey || (event.button === 1),
		event: event
	});
	if(this.domNodes[0].hasAttribute("href")) {
		event.preventDefault();
	}
	event.stopPropagation();
	return false;
};