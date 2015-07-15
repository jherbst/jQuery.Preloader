//  ====================================================================================================
//  PRELOAD Functions
//  ====================================================================================================


//  ====================================================================================================
//  Preload Prototype
//	Function: Preloader(content)
//  
//	Description: Create a new preload and start it
//	
//	ARGS: content(string or array ) the content to be preloaded
//									this can be one or an array of files to preload.
//									it can also be a page to search for files that need to be preloaded
//									accepts relative or absolute paths
//	RETURNS: (none)
//  ====================================================================================================

Preloader = function (content) {

	//if this isn't a new Preloader make it a new one.
	if (!(this instanceof Preloader)) {
		return new Preloader(content);
	} //if
	
	this.fileList = [];																							//the file list for preloading
	this.unloadedContent = typeof content != 'string' && typeof content[0] != 'undefined'? content.length : 1;	//the number of items in "content" that must be loaded
	this.unloadedFiles = 0;																						//the number of files that must be loaded
	this.currentFiles = this.getCurrentFiles();																	//the files that are loaded on the current page
	this.container = document.createElement('div');																//container to place the preload elements in

	//Append the container to the body and style it to be hidden
	$(this.container).appendTo("body").css({
		display: "none",
		width: 0,
		height: 0,
		overflow: "hidden"

	});//$(this.container)...

	//begin preloading content
	this.preloadContent(content);
	
}; //Preloader(content)


//  ====================================================================================================
//  Get the Current Files
//	Function: Preloader.getCurrentFiles()
//  
//	Description: Gets the files loaded on the current page
//	
//	ARGS: (none)
//	RETURNS: (none)
//  ====================================================================================================

Preloader.prototype.getCurrentFiles = function () {
	return this.findFiles($('html').html(), document.URL);
}; //Preloader.getCurrentFiles()


//  ====================================================================================================
//  Preload Main Function
//	Function: Preloader.preloadContent(content)
//  
//	Description: Starts Preloading files
//	
//	ARGS: content(string or array ) the content to be preloaded
//									this can be one or an array of files to preload.
//									it can also be a page to search for files that need to be preloaded
//	RETURNS: (none)
//  ====================================================================================================

Preloader.prototype.preloadContent = function (content) {
	var n = 0,				//counter
		fileType;			//the file's extension

	//if content is an array
	if (typeof content != 'string' && typeof content[0] != undefined) {
		// n = the number of items in content
		n = content.length;
		// for each item
		while (n--) {
			//get the file type
			fileType = content.slice(content.lastIndexOf('.') + 1, content.length);
			//If the file is a page type
			if ($.inArray(fileType, ['asp', 'aspx', 'html', 'htm', 'php', 'xhtml', 'jhtml']) != -1) {
				//load the files in the page
				this.loadPage(content[n]);
			} //if
			else {
				//load the individual file
				this.addFile(content[n]);
				//one less unloaded content
				this.unloadedContent--;
			} //else
		} //while
	} //if
	// else if the content is a string
	else if (typeof content == 'string') {
		//get the file type
		fileType = content.slice(content.lastIndexOf('.') + 1, content.length);
		//If the file is a page type
		if ($.inArray(fileType, ['asp', 'aspx', 'html', 'htm', 'php', 'xhtml', 'jhtml']) != -1) {
			//load the files in the page
			this.loadPage(content);
		} //if
		else {
			//load the individual file
			this.addFile(content);
			//one less unloaded content
			this.unloadedContent--;
		} //else
	} //else if
}; //Preloader.preloadContent(content)


//  ====================================================================================================
//  load Files
//	Function: Preloader.loadFiles()
//  
//	Description: Starts Preloading files
//	
//	ARGS: (none)
//	RETURNS: (none)
//  ====================================================================================================

Preloader.prototype.loadFiles = function(){
	var n = 0;													//counter
	// for each file in the list load the file
	for(n = 0; n < this.fileList.length; n++){
		this.loadFile(this.fileList[n]);
	}//for
};//Preloader.loadFiles(content)


//  ====================================================================================================
//  load File
//	Function: Preloader.loadFiles(file)
//  
//	Description: Starts Preloading files
//	
//	ARGS: file (string) - the full path of the file
//	RETURNS: (none)
//  ====================================================================================================

Preloader.prototype.loadFile = function (file) {

	var fileType = file.substring(file.lastIndexOf('.') + 1, file.length);	 //the extension of the file
	//if the extension has a query string remove it
	if (fileType.indexOf('?') != -1) {
		fileType = fileType.substring(0, fileType.indexOf('?'));
	}//if
	//if it is an image load the image
	if ( $.inArray(fileType, ['png', 'jpg', 'jpeg', 'gif', 'bmp']) != -1){
		this.loadImage(file);
	}//if
	//if it is a script load the script
	else if (fileType == 'js'){
		this.loadJS(file);
	}//else if
	//if it is a stylesheet load the stylesheet
	else if (fileType == 'css') {
		this.loadCSS(file);
	}//else if
	//if it is none of these go straight to complete
	else {
		//console.error('Preload Error - Invalid File Type: ' + fileType + ' (File: ' + file + ')');
		this.fileCompleted();
	}//else

}; //Preloader.loadFiles(file)


//  ====================================================================================================
//  load page
//	Function: Preloader.loadPage(file)
//  
//	Description: Starts Preloading files from a page
//	
//	ARGS: file (string) - the full path of the page
//	RETURNS: (none)
//  ====================================================================================================

Preloader.prototype.loadPage = function (file) {
	file = this.getFullPath(file, document.URL);	//get the full path of the file

	//get the content of the file
	$.get(file)
	// on done find the files and add them to the list and mark content as complete
	.done(function(data) {
		this.addFile(this.findFiles(data, file));
		this.contentComplete();
	}.bind(this))//done
	// if fail show error in console and mark content as complete
	.fail(function () {
		console.error('Preload Error - Could not load page: ' + file + '.');
		this.contentComplete(); 
	}.bind(this));//fail
}; //Preloader.loadPage(file)


//  ====================================================================================================
//  findFiles
//	Function: Preloader.findFiles(data, page)
//  
//	Description: Finds all files on the loaded page
//	
//	ARGS:	data (string) - the content of the page
//			page (string) - the full path of the page
//	RETURNS: files [array] - the list of files on the page
//  ====================================================================================================

Preloader.prototype.findFiles = function (data, page) {
	var m,																					// m is the reg ex match
		files = [],																			// the list of files on the page
		rex = /<(img|link|script)\s[^>]*?(src|href)\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/g,	//the reg ex to find the files
		currentFile;																		//the current file in the while statement

	//while the regex.exec finds matches
	while (m = rex.exec(data)) {
		 //get the full path of the current file
		currentFile = this.getFullPath(m[3], page)
		//add the current file to the files array
		files.push(currentFile);
	}
	//return the files
	return files;
}; //Preloader.findFiles(data, page)


//  ====================================================================================================
//  Add file
//	Function: Preloader.addFile(files)
//  
//	Description: adds the file or files to the file list
//	
//	ARGS:	files (string or array) of files to add to the fileList
//	RETURNS: (none)
//  ====================================================================================================

Preloader.prototype.addFile = function (files) {
	var n = 0;														//counter

	//if it is an array
	if (typeof files != 'string' && typeof files[0] != undefined) {
		//set n as the number of files
		n = files.length;
		//loop through files
		while (n--) {
			//if the file isn't on the current page
			if ($.inArray(files[n], this.currentFiles) == -1) {
				//and the file isn't already in the fileList
				if ($.inArray(files[n], this.fileList) == -1) {
					//Add 1 to unloaded files count
					this.unloadedFiles++;
					//Add file to fileList
					this.fileList.push(files[n]);
				}//if
			}//if
		}//while
	}//if

	//else if it is a string
	else if (typeof content == 'string') {
		//if the file isn't on the current page
		if ($.inArray(files, this.currentFiles) == -1) {
			//and the file isn't already in the fileList
			if ($.inArray(files, this.fileList) == -1) {
				//Add 1 to unloaded files count
				this.unloadedFiles++;
				//Add file to fileList
				this.fileList.push(files);
			}//if
		}//if
	}//else if
}; //Preloader.addFile(files)


//  ====================================================================================================
//  Load Image
//	Function: Preloader.loadImage(file)
//  
//	Description: loads the image file
//	
//	ARGS:	file (string) File name to load
//	RETURNS: (none)
//  ====================================================================================================

Preloader.prototype.loadImage = function(file){
	var el = document.createElement('img');		//create IMG element
	//append to the container
	this.container.appendChild(el);
	//set the Onload event
	el.onload = this.fileCompleted.bind(this);
	// set the source
	el.src = file;

};//Preloader.loadImage(file)


//  ====================================================================================================
//  Load Script
//	Function: Preloader.loadJS(file)
//  
//	Description: loads the image file
//	
//	ARGS:	file (string) File name to load
//	RETURNS: (none)
//  ====================================================================================================

Preloader.prototype.loadJS = function(file){
	var el = document.createElement('script');	//create script element
	//append to the container
	this.container.appendChild(el);
	//set the Onload event
	el.onload = this.fileCompleted.bind(this);
	// set the source
	el.src = file;
}; // Preloader.loadJS(file)


//  ====================================================================================================
//  Load Stylesheet
//	Function: Preloader.loadCSS(file)
//  
//	Description: loads the css file
//	
//	ARGS:	file (string) File name to load
//	RETURNS: (none)
//  ====================================================================================================

Preloader.prototype.loadCSS = function (file) {
	var el = document.createElement('link');	//create link element
	//append to the container
	this.container.appendChild(el);
	//set the Onload event
	el.onload = this.fileCompleted.bind(this);
	// set the rel
	el.rel = 'stylesheet';
	// set the href
	el.href = file;
}; //Preloader.loadCSS(file)


//  ====================================================================================================
//  File Completed Function
//	Function: Preloader.fileCompleted()
//  
//	Description: runs after a file has completed loading
//	
//	ARGS:	(none)
//	RETURNS: (none)
//  ====================================================================================================

Preloader.prototype.fileCompleted = function () {
	//subtract 1 from unloaded Files
	this.unloadedFiles--;
	//If this was the last file complete the process
	if (this.unloadedFiles == 0) {
		this.Completed();
	}//if
};//Preloader.fileCompleted()


//  ====================================================================================================
//  Completed Function
//	Function: Preloader.fileCompleted()
//  
//	Description: runs after all files have completed loading - removes the container from the body
//	
//	ARGS:	(none)
//	RETURNS: (none)
//  ====================================================================================================

Preloader.prototype.Completed = function () {
	//remove the container
	document.body.removeChild(this.container);
}; //Preloader.fileCompleted()


//  ====================================================================================================
//  Get Full Path Function
//	Function: Preloader.getFullPath(to, from)
//  
//	Description: gets the full path of a file (to) based upon the location of another (from)
//	
//	ARGS:	to (string) - the file to get the full path of
//			from (string) - the file to base a relative path on
//	RETURNS: newURL(string) - the full path of the file (to)
//  ====================================================================================================

Preloader.prototype.getFullPath = function (to, from) {
	var pathArray = from.split('/'),					//array of the path of from
		pathDepth = pathArray.length - 4,				//depth of the path folders to from
		domain = pathArray[0] + '//' + pathArray[2],	//the domain of from
		newURL = domain,								//the newURL for to
		n = 0;											//counter

	//remove the file name and the domain from the pathArray
	pathArray = pathArray.slice(3, pathArray.length - 1);	

	//while there is a ../ remove it and go back one folder in the path depth
	while (to.indexOf('../') == 0) {
		to = to.substring(3, to.length);
		pathDepth--;
	}//while
	//if to is a complete path return it
	if (to.indexOf('http://') == 0 || to.indexOf('https://') == 0) {
		return to;
	}//if
	//if to directs to the domains base directory path depth = 0
	else if (to.indexOf('/') == 0) {
		pathDepth = 0;
	}//else if
	//if to directs to the domains base directory path depth = 0 and remove the tilda
	else if (to.indexOf('~/') == 0) {
		pathDepth = 0;
		to = to.substring(1, to.length);
	}//else if
	//else add a "/" to to
	else {
		to = '/' + to;
	}//else
	// for the path depth add the corresponding folder to the newURL
	for (n = 0; n < pathDepth; n++) {
		newURL += '/' + pathArray[n];
	}//for
	//add to to the newURL
	newURL += to;
	//return the newURL
	return newURL;
};// Preloader.getFullPath(to, from)


//  ====================================================================================================
//  Content Complete Function
//	Function: Preloader.contentComplete()
//  
//	Description: runs when a content is loaded, if it is the last content it will then load the files
//	
//	ARGS:	to (string) - the file to get the full path of
//			from (string) - the file to base a relative path on
//	RETURNS: newURL(string) - the full path of the file (to)
//  ====================================================================================================

Preloader.prototype.contentComplete = function () {
	//unloadedContent is one less
	this.unloadedContent--;
	//if this was the last Content to load load the files
	if (this.unloadedContent == 0) {
		this.loadFiles();
	}//if
}; //Preloader.contentComplete()
		
//  ====================================================================================================
//  END OF PRELOAD Functions
//  ====================================================================================================