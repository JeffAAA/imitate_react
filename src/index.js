import { render } from '../react/react-dom'
import React from '../react/react'
import _ from 'underscore'
let style = {
    height: '100px',
    width: '100px',
    backgroundColor: 'green'
}

class ClassComponent extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            text: props.text
        };
    }
    componentWillMount() {
        console.log('componentWillMount')
    }
    componentWillReceiveProps() {
        console.log('componentWillReceiveProps')
    }
    componentWillUpdate() {
        console.log('componentWillUpdate')
    }
    componentDidMount() {
        console.log('componentDidMount')
    }
    componentDidUpdate() {
        console.log('componentDidUpdate')
    }

    onClick() {
        let state = _.clone(this.state);
        state.text = `${state.text},收到点击事件`
        this.setState(state)
    }
    render() {
        return <div className="class-component" onClick={() => { this.onClick() }}>
            {this.state.text}
        </div>
    }
}

const FuncConponent = function ({ text = '' }) {
    return <div className="function-component">
        {text}
    </div>
}

let node = <div className="ds">
    <div className="node" style={style}>
        dom组件
    </div>
    <ClassComponent text={'class-component'} />
    <FuncConponent text={'function-component'} />
</div>
render(node, document.getElementsByTagName('body')[0])

