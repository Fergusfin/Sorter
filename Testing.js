import fs from 'fs'
import path from 'path'
import async from 'async'
import mime from 'mime'
import _ from 'lodash'
import { EventEmitter } from 'events'
import recursiveReadDir from 'recursive-readdir'
import { v4 as uuid } from 'node-uuid'
import ptn from 'parse-torrent-name'
import mkdirp from 'mkdirp'



class sorter extends EventEmitter {
    constructor({ downloadPath, moviePath, seriesPath, debugPath }) {
        super()

        if (!downloadPath || !(moviePath && seriesPath || debugPath))
            return console.error('You done fucked up.')

        this.moviePath = debugPath ? path.join(debugPath, 'movies') : path.normalize(moviePath)
        this.seriesPath = debugPath ? path.join(debugPath, 'series') : path.normalize(seriesPath)

        Promise.all([this.checkAndCreateDir(this.moviePath), this.checkAndCreateDir(this.seriesPath)])
            .then(() => this.parseDir(path.normalize(downloadPath)))
            .then(files => Promise.all(files.map(::this.parseFile)))
            .then(parsed => Promise.all(parsed.map(::this.organiseFile)))
            .then(() => console.log('All Done :)'))
            .catch(console.error)
    }

    fsQueue = async.queue(({ jobType, parsePath, movePath, requestID }, next) => {
        switch (jobType) {
            case 'parseFolder':
                recursiveReadDir(parsePath, (err, files) => {
                    this.emit(requestID, this.filterVideoFiles(files))
                    next()
                })
                break
            case 'parseFile':
                const parsed = ptn(path.parse(parsePath).name)
                parsed.originalPath = parsePath
                parsed.type = (parsed.episode && parsed.episode) ? 'series' : 'movie'
                this.emit(requestID, parsed)
                next()
                break
            case 'moveFile':
                fs.rename(parsePath, movePath, err => {
                    if (err) console.error(err)
                    this.emit(requestID)
                    next()
                })
                break
            case 'checkAndCreateDir':
                mkdirp(parsePath, () => {
                    this.emit(requestID)
                    next()
                })
                break
        }
    }, 5); //lets allow 5 fs operations going at once

    parseDir(parsePath) {
        const requestID = uuid()
        return new Promise(resolve => {
            this.fsQueue.push({ jobType: 'parseFolder', requestID, parsePath })
            this.once(requestID, resolve)
        })
    }

    parseFile(parsePath) {
        const requestID = uuid()
        return new Promise(resolve => {
            this.fsQueue.push({ jobType: 'parseFile', requestID, parsePath })
            this.once(requestID, resolve)
        })
    }

    organiseFile({ type, year, originalPath, title, season, episode }) {
        const requestID = uuid()

        return new Promise(resolve => {
            let movePath = originalPath
            switch (type) {
                case 'movie':
                    movePath = path.join(this.moviePath, `${title}${path.extname(originalPath)}`)
                    break
                case 'series':
                    movePath = path.join(this.seriesPath, `${title} ${year ? year : ''}`.trim(), `Season ${season}`, `${title} - S${('0' + season).slice(-2)}E${('0' + episode).slice(-2)}${path.extname(originalPath)}`)
                    break
            }

            this.checkAndCreateDir(path.dirname(movePath))
                .then(() => this.fsQueue.push({ jobType: 'moveFile', requestID, parsePath: originalPath, movePath }))
            this.once(requestID, resolve)
        })
    }

    checkAndCreateDir(parsePath) {
        const requestID = uuid()

        return new Promise(resolve => {
            this.fsQueue.push({ jobType: 'checkAndCreateDir', requestID, parsePath })
            this.once(requestID, resolve)
        })
    }

    filterVideoFiles(files) {
        return _.filter(files, file => {
            const { ext, name } = path.parse(file)
            if (!ext.replace(/ /, '').length > 1) return false // No dot files
            if (name.toLowerCase().includes('sample') || name.toLowerCase().includes('preview')) return false // No previews pls
            return mime.lookup(ext).includes('video')
        })
    }
}


new sorter({ downloadPath: '//10.0.1.4/plex_1/downloads/COMPLETED', debugPath: '//10.0.1.4/plex_1/debug' })
