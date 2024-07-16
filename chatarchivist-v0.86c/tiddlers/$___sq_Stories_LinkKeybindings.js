$tw.hooks.addHook('th-navigating', function(event) {
	//override core behaviour when shift key was used
	if(event.event && event.event.shiftKey && event.navigateTo) {
		var stories = $tw.wiki.getTiddlerList('$:/_sq/Stories/StoriesList');
		var node = event.navigateFromNode;
		//could do node.getVariable("tv-story-list") to get the story list here.
		var thisStory = node.getVariable("tv-story-list");
/*
		while (node.parentWidget) {
			node = node.parentWidget;
			if(node.storyTitle)
				break;
		}

		var thisStory = node.storyTitle;
*/		
		var otherStory = (stories[0] == thisStory)? stories[1] : stories[0];
	
		var storyList = $tw.wiki.getTiddlerList(otherStory);
		var slot = storyList.indexOf(event.navigateTo);
		
		//XXX focus story instead
		if(slot < 0){
			if(node.getAttribute("openLinkFromOutsideRiver","top") === "bottom") {
			//XXX should respect openLinkFromOutsideRiver
				storyList.splice(storyList.length, 0, event.navigateTo);
			} else {
				storyList.splice(0, 0, event.navigateTo);
			}
			var storyTiddler =	$tw.wiki.getTiddler(otherStory);
			$tw.wiki.addTiddler(new $tw.Tiddler(
				{title: otherStory},
				storyTiddler,
				{list:storyList}
			));
		}
		var histories = $tw.wiki.getTiddlerList('$:/_sq/Stories/HistoriesList');
//		var thisHistory = node.historyTitle;
		var thisHistory = node.getVariable("tv-history-list");
		var otherHistory = (histories[0] == thisHistory) ? histories[1] : histories[0];
		
		$tw.wiki.addToHistory(event.navigateTo,event.navigateFromClientRect, otherHistory); 
		
		//var historyList = $tw.wiki.getTiddlerData(otherHistory,[]);
		//historyList.push({title: event.navigateTo, fromPageRect: null });
		
		//$tw.wiki.setTiddlerData(otherHistory, historyList, {"current-tiddler": event.navigateTo});
		
		event.navigateTo = false;
	}
	return event;
});