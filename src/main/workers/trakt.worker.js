workers.trakt = class {
    constructor(port) {
        this.trakt = traktAPI('get_your_own_api_key_pleb')
        this.socket = socketClient(`http://localhost:${port}`)

        this.socket.on('connect', () => {
            this.log('Socket Connected!', 'info')
            this.socket.emit('initiated')
        })
        this.socket.on('disconnect', () => this.log('Socket Disconnected!', 'info'))

        this.initEvents()
    }

    log = (message, type = 'log') => this.socket.emit('info', {
        source: 'Trakt Worker',
        type,
        message
    });

    initEvents() {
        this.socket.on('trakt:get:search', ({ id, imdb, tvdb, slug, type, year }) => this.trakt.search((imdb || tvdb || slug), type, year)
            .then(results => this.socket.emit('trakt', { id, data: _.remove(results, data => (data.type === type))[0] }))
            .catch(error => this.socket.emit('trakt:error', { id, error })))

        this.socket.on('trakt:get:movie', ({ id, imdb, tvdb, slug }) => Promise.all([this.trakt.movie((imdb || tvdb || slug), { extended: 'full,images' }), this.trakt.moviePeople((imdb || tvdb || slug), { extended: 'full,images' })])
            .then(([movie, people]) => this.socket.emit('trakt', { id, data: {...movie, people } }))
            .catch(error => this.socket.emit('trakt:error', { id, error })))

        this.socket.on('trakt:get:episode', ({ id, imdb, tvdb, slug, season, episode }) => this.trakt.episode((imdb || tvdb || slug), season, episode, { extended: 'full,images' })
            .then(data => this.socket.emit('trakt', { id, data }))
            .catch(error => this.socket.emit('trakt:error', { id, error })))

        this.socket.on('trakt:get:show', ({ id, imdb, tvdb, slug }) => Promise.all([this.trakt.show((imdb || tvdb || slug), { extended: 'full,images' }), this.trakt.showPeople((imdb || tvdb || slug), { extended: 'full,images' })])
            .then(([show, people]) => this.socket.emit('trakt', { id, data: {...show, people } }))
            .catch(error => this.socket.emit('trakt:error', { id, error })))
    }
}
