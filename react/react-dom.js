import _ from 'underscore'
/**
 * render
 * @param {*} vNode 
 * @param {*} container 
 * 渲染虚拟DOM
 */
const render = function (vNode, container) {
    return container.appendChild(_render(vNode));
}

const _render = function (vNode = '') {
    let { type = '', props = {} } = vNode;

    if (typeof vNode == 'string') {
        return document.createTextNode(vNode);
    } else if (typeof type == 'function') {
        let component = createComponent(vNode);
        beforeComponentMount(component, props);
        renderComponent(component);
        return component._realNode
    } else if (typeof type == 'string') {
        let { children = [] } = props;
        let node = document.createElement(type);
        // 把props传递到dom上
        if (!_.isEmpty(props)) {
            mapPropsToNode(props, node);
        }
        //递归渲染子节点
        if (!_.isEmpty(children)) {
            mountChildren(children, node);
        }
        return node
    }
}

/**
 * mapPropsToNode
 * @param {*} props 
 * @param {*} node 
 * 遍历props至节点上
 */
const mapPropsToNode = function (props = {}, node) {
    for (let key in props) {
        setAttr(node, key, props[key]);
    }
}

/**
 * setAttr
 * @param {*} node 
 * @param {*} key 
 * @param {*} value 
 * 为真实节点设置属性
 */
const setAttr = function (node, key, value) {
    if (key === 'children') return;
    if (key === 'className') key = 'class';
    if (key === 'style') {
        //处理样式
        if (!value || typeof value === 'string') {
            node.style.cssText = value || '';
        } else if (value && typeof value === 'object') {
            for (let styleName in value) {
                node.style[styleName] = value[styleName];
            }
        }
    } else if (/on\w+/.test(key)) {
        //处理事件绑定
        key = key.toLowerCase();
        node[key] = value || '';
    } else {
        //剩余的属性直接覆盖更新
        if (key in node) {
            node[key] = value || '';
        }
        if (value) {
            node.setAttribute(key, value);
        } else {
            node.removeAttribute(key, value);
        }
    }
}

/**
 * mountChildren
 * @param {*} children 
 * @param {*} node 
 * 渲染子节点
 */
const mountChildren = function (children = [], node) {
    children.forEach(child => {
        render(child, node)
    })
}


/**
 * createComponent
 * @param {*} vNode 
 * 接受一个虚拟DOM，生成一个函数式组件或者类组件
 */
const createComponent = function (vNode) {
    let { type: constructor = '', props = {} } = vNode;
    let isClass = constructor.prototype && constructor.prototype.render;
    let instance = null;
    if (isClass) {
        instance = new constructor(props);
    } else {
        //给函数式组件添加一个render方法，相当于调用自身
        instance = new constructor(props);
        instance.constructor = constructor;
        instance.render = function () {
            return this.constructor(props);
        }
    }
    return instance
}

/**
 * beforeComponentMount
 * @param {*} component 
 * @param {*} props 
 * 实现componentWillMount 和 componentWillReceiveProps
 */
const beforeComponentMount = function (component, props) {
    if (_.isEmpty(component._realNode)) {
        //这个方法始终只执行一次
        component.componentWillMount && component.componentWillMount();
    } else {
        component.componentWillReceiveProps && component.componentWillReceiveProps(props);
    }
}

/**
 * renderComponent
 * @param {*} component 
 * 实现componentWillUpdate，componentDidUpdate，componentDidMount
 */
const renderComponent = function (component) {
    //首先存在真实组件，意味着是更新状态
    if (component._realNode) {
        component.componentWillUpdate && component.componentWillUpdate();
    }
    //取更新后的虚拟DOM，运行diff函数后生成真实DOM
    let vNode = component.render();
    let node = diff(component._realNode, vNode);
    //存在真实组件，意味着不是首次挂载
    if (component._realNode) {
        //componentDidMount在后续的挂载时调用
        component.componentDidUpdate && component.componentDidUpdate();
    } else {
        component.componentDidMount && component.componentDidMount();
    }
    //替换新的DOM
    if (component._realNode && component._realNode.parentNode) {
        component._realNode.parentNode.replaceChild(node, component._realNode);
    }
    component._realNode = node;
}

/**
 * diff
 * @param {*} dom 
 * @param {*} vNode 
 */
const diff = function (dom, vNode) {
    // const ret = diffNode(dom, vNode);
    let newNode = dom;
    if (typeof vNode === 'string') {
        if (dom && dom.nodetype === 3) {
            if (dom.textContent !== vNode) {
                dom.textContent = vNode;
            }
        } else {
            newNode = document.createTextNode(vNode);
            dom && dom.parentNode && dom.parentNode.replaceChild(newNode, dom);
        }
    }
    if (typeof vNode.type === 'function') {
        diffComponent(dom, vNode);
    }
    //如果虚拟node类型为元素，且与真实dom标签类型不同，则替换为虚拟node的类型
    if (_.isEmpty(dom) || !isSameNodeType(dom, vNode)) {
        newNode = document.createElement(vNode.type);
        //把子元素遍历进新的dom
        dom && _.map([...dom.childNodes], newNode.appendChild);
        //替换新的dom
        dom && dom.parentNode && dom.parentNode.replaceChild(newNode, dom);
        if (vNode.children && vNode.children.length > 0) {
            //比对子元素
            // diffChildren(newNode, vNode.children);
        }
        //比对属性
        diffAttributes(newNode, vNode);
    }
}

/**
 * isSameNodeType
 * @param {*} dom 
 * @param {*} vNode 
 */
const isSameNodeType = function (dom, vNode) {
    if (typeof vNode === 'string' || typeof vNode === 'number') {
        //则是同种类型
        return dom.nodeType === 3;
    }

    if (typeof vNode.type === 'string') {
        return dom.nodeName.toLowerCase() === vNode.type.toLowerCase();
    }

    return dom && dom._component && dom._component.constructor === vNode.type;
}

const diffChildren = function () {

}

/**
 * diffAttributes
 * @param {*} dom 
 * @param {*} vNode 
 * 比对props
 */
const diffAttributes = function (dom, vNode) {
    const oldAttrs = {};
    let { props = {} } = vNode;
    _.each(dom.attributes, ({ name = '', value = '' }) => oldAttrs[name] = value);
    //更新属性
    for (let key in oldAttrs) {
        setAttr(dom, key, props[key]);
    }
}

const diffComponent = function () {
    
}


export { render, renderComponent }