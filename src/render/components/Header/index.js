class Header extends Component {
    render() {
        return (
            <header>
                <span className="title">Ethans Sorter Thingy</span>
                <div className="os-controls">
                    <paper-icon-button onClick={() => remote.getCurrentWindow().minimize()} className="minimize" icon="remove"/>
                    <paper-icon-button onClick={() => (remote.getCurrentWindow().isMaximized() ? remote.getCurrentWindow().unmaximize() : remote.getCurrentWindow().maximize())} className="maximize" icon="check-box-outline-blank"/>
                    <paper-icon-button onClick={() => remote.getCurrentWindow().close()} className="close" icon="close"/>
                </div>
            </header>
        )
    }
}