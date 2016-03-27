const settingsStore = localforage.createInstance({
    name: 'ethans-sorter-thing',
    version: 1.0
})


class Framework extends Component {

    state = {
        initializing: 'App Initializing',
        initializingDots: '',
        page: 'home',
        pageData: {}
    };

    componentWillMount() {
        this.workers = new InitWorkers()
        this.workers.once('initiated', () => {
            // _.defer(() => this.setState({ initializing: false }))
        })
    }

    componentDidMount() {
        this.addDaDots()
    }

    addDaDots() {
        const loadingDotsAdder = setInterval(() => {
            const { initializing, initializingDots } = this.state
            if (!initializing) return clearInterval(loadingDotsAdder)

            let initializingDotsNew = initializingDots

            if (initializingDots.length === 3) initializingDotsNew = ''
            else initializingDotsNew = initializingDotsNew + '.'

            this.setState({ initializingDots: initializingDotsNew })
        }, 400)
    }

    _changePage = (page = 'home', pageData = {}) => this.setState({ page, pageData });

    _getContents() {
        let contents
        switch (this.state.page) {
            case 'home':
                contents = null
                break
            default:
                contents = null
        }
        return contents
    }

    _getCoreContents() {
        const { initializing, initializingDots } = this.state
        if (initializing) {
            return (
                <div className="loading-spinner-wrapper">
                    <style is="custom-style" dangerouslySetInnerHTML={{ __html: 'paper-spinner.thin {--paper-spinner-stroke-width: 2px;}'}}/>
                    <h1 className="status-text">{initializing + initializingDots}</h1>
                    <paper-spinner className="loading-spinner thin" active={true}/>
                </div>
            )
        } else {
            return (
                <ReactCSSTransitionGroup transitionName="cross-fade" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                    <div className='transition-container' key={this.state.page}>
                        {::this._getContents()}
                    </div>
                </ReactCSSTransitionGroup>
            )
        }
    }

    render() {
        return (
            <div className='app-framework'>
                <Header />
                {::this._getCoreContents()}
            </div>
        )
    }
}
