$tw.hooks.addHook("th-editing-tiddler", function(event) {
  var targetTitle = event.tiddlerTitle;
  var stories = $tw.wiki.getTiddlerList('$:/_sq/Stories/StoriesList');
  var draftTitle = $tw.wiki.findDraft(targetTitle);
  var shiftKey = event.event.shiftKey;

 //if !draftTitle, its not open anywhere
  //cant be open without existing, but can exist without being opened

  if(!draftTitle && !shiftKey) {
    return true;
  }

  var node = event.navigateFromNode;
  while (node.parentWidget) {
      node = node.parentWidget;
      if(node.storyTitle)
          break;
  }

  var thisStory = node.storyTitle;
  var otherStory = (stories[0] == thisStory)? stories[1] : stories[0];
  var otherStoryList = $tw.wiki.getTiddlerList(otherStory);

  if(otherStoryList.indexOf(draftTitle) > -1) {
    alert("This tiddler is already open for editing in the other story");
    return false;
  }


  var generateDraftTitle = function(title) {
  	var c = 0,
  		draftTitle;
  	do {
  		draftTitle = "Draft " + (c ? (c + 1) + " " : "") + "of '" + title + "'";
  		c++;
  	} while($tw.wiki.tiddlerExists(draftTitle));
  	return draftTitle;
  };


  if(shiftKey) {
    //open in other story
    if(!draftTitle) {
      var tiddler = $tw.wiki.getTiddler(targetTitle);
      draftTitle = generateDraftTitle(targetTitle);
      var draftTiddler = new $tw.Tiddler(
        tiddler,
        {
          title: draftTitle,
          "draft.title": targetTitle,
          "draft.of": targetTitle
        },
        $tw.wiki.getModificationFields()
      );
      $tw.wiki.addTiddler(draftTiddler);
    }
    var otherStoryTiddler = $tw.wiki.getTiddler(otherStory);
    otherStoryList.splice(0 ,0, draftTitle);
    $tw.wiki.addTiddler(new $tw.Tiddler(
      {title: otherStory},
      otherStoryTiddler,
      {list:otherStoryList}
    ));
    return false;
  }

  return true;
});
