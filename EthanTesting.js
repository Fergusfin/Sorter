const fs = require('fs');
var ptn = require('parse-torrent-name');
var mime = require('mime');
var path = require('path');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf')

DownloadPath = "//10.0.1.32/Media/Testing/Downloads";
MoviePath = "//10.0.1.32/Media/Testing/Movies";
TVShowPath = "//10.0.1.32/Media/Testing/TV Shows";
SortPath = "//10.0.1.32/Media/Testing/Sort"

function findFiles(mediaPath){
	items = fs.readdirSync(mediaPath);
	items.forEach(item => {
		if(mime.lookup(mediaPath + '/' + item).includes('video') && !item.includes('sample' || 'example')) moveFiles(mediaPath + '/' + item);
		else if(fs.statSync(mediaPath + '/' + item).isDirectory()) findFiles(mediaPath + '/' + item);
	});
	if(mediaPath != DownloadPath) rimraf(mediaPath, [false], function() {console.log("DELETED A FOLDER (I hope it didnt have anything important in it)")})
}

function moveFiles(mediaPath){
	item = ptn(path.basename(mediaPath))
	if(item.season != null && item.episode != null && item.title != null){ //if it is a TV Show episode
		fs.open((TVShowPath + '/' + item.title + '/Season ' + item.season),'r',function(err,fd){
		    if (err && err.code=='ENOENT'){
		    		mkdirp((TVShowPath + '/' + item.title + '/Season ' + item.season), function (err) {
						if (err) console.error(err)
    					else fs.renameSync(mediaPath, (TVShowPath + '/' + item.title + '/Season ' + item.season + '/' + path.basename(mediaPath)))
					});
		    }
		    else fs.renameSync(mediaPath, (TVShowPath + '/' + item.title + '/Season ' + item.season + '/' + path.basename(mediaPath)))
		});
	}
	else if(!item.season && !item.episodeName && !item.episode){ //if it is a movie
		fs.open((MoviePath),'r',function(err,fd){
		    if (err && err.code=='ENOENT'){
		    		mkdirp((MoviePath), function (err) {
						if (err) console.error(err)
    					else fs.renameSync(mediaPath, (MoviePath + '/' + path.basename(mediaPath)))
					});
		    }
		    else fs.renameSync(mediaPath, (MoviePath + '/' + path.basename(mediaPath)))
		});
	}
	else
		fs.open((SortPath),'r',function(err,fd){
		    if (err && err.code=='ENOENT'){
		    		mkdirp((SortPath), function (err) {
						if (err) console.error(err)
    					else fs.renameSync(mediaPath, (SortPath + '/' + path.basename(mediaPath)))
					});
		    }
		    else fs.renameSync(mediaPath, (SortPath + '/' + path.basename(mediaPath)))
		});
}

findFiles(DownloadPath);
