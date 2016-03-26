class InitWorkers extends EventEmitter {
    constructor() {
        super()

        this.initiated = false

        getPort()
            .then(port => this.port = port)
            .then(::this.initSocketServer)
            .then(() => {
                this.workers = ['trakt']
                this.workers.map(worker => new Worker(path.join(__dirname, 'workers.js'), true).postMessage({ port: this.port, worker }))
            })
            .then(::this.initSocketEvents)
            .catch(console.error)
    }

    initSocketServer() {
        return new Promise((resolve, reject) => {
            const httpServer = createServer(express())
            this.socket = socketIO(httpServer)
            console.info(`Socket Server running on port: ${this.port}`)
            httpServer.listen(this.port, resolve)
        })
    }

    initSocketEvents() {
        let loggedWorkers = 0
        this.socket.on('connection', socket => {

            socket.on('trakt', ({ id, data }) => this.emit(id, data))
            socket.on('trakt:error', ({ id, error }) => this.emit(`${id}:error`, error))

            socket.on('initiated', () => {
                loggedWorkers++
                if (loggedWorkers === this.workers.length) {
                    this.initiated = true
                    console.info('All workers initialized successfully')
                    this.emit('initiated')
                }
            })
            socket.on('info', ({ type, source, message }) => console[type](`${source}:`, message))
        })
    }
}
