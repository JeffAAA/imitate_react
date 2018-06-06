import _ from 'underscore'
import { renderComponent } from './react-dom'

/**
 * createElement
 * @param {*} type 
 * @param {*} props 
 * @param {*} children 
 * React的入口函数
 */
const createElement = function (type, props = {}, ...children) {
    props = props || {};
    let { key = null, ref = null } = props;
    let childLength = children.length;
    let newProps = {};
    if (!_.isEmpty(props)) {
        for (let key in props) {
            if (key == 'key' || key == 'ref') continue;
            if (props[key]) {
                newProps[key] = props[key];
            }
        }
        newProps.children = [...children];
        return new vNode(type, newProps, key, ref)
    }
}

/**
 * vNode
 * 虚拟DOM
 */
class vNode {
    constructor(type, props, key, ref) {
        this.type = type;
        this.props = props;
        this.key = key;
        this.ref = ref;
    }
}

/**
 * Component
 * react组件
 * 具有生命周期和setState函数
 */
class Component {
    constructor(props) {
        this.props = props;
        this.state = this.state || {};
    }

    setState(newState = {}) {
        // 将修改合并到state
        Object.assign(this.state, newState);
        renderComponent(this);
    }

    render() {

    }
}

const React = {
    createElement,
    Component
}


export default React