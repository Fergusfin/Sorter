//this is not yet an app this is testing

const fs = require('fs')
var ptn = require('parse-torrent-name')

DownloadPath = "//10.0.1.32/Media/Downloads"

Downloads = fs.readdirSync(DownloadPath)

for(i=0; i<Downloads.length; i++){
	item = ptn(Downloads[i])
	if(item.season != null && item.episode != null){
		console.log("TV Show")
		console.log(item.season)
		console.log(item.episode)
	}
	else if(item.season == null && item.episodeName == null && item.episode == null) console.log("Movie")
	else console.log("Unsure")
	console.log(item.title)
}