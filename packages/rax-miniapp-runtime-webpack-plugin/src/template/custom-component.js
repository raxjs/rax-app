/* global Component */
const render = require('miniapp-render');

const { Event, cache, tool } = render.$$adapter;

/**
 * Check component attributes
 */
function checkComponentAttr({ props = [] }, name, domNode, destData, oldData) {
  if (props.length) {
    for (const name of props) {
      const newValue = domNode.getAttribute(name);
      if (!oldData || oldData[name] !== newValue) destData[name] = newValue;
    }
  }

  // Add id, class and style
  const newId = domNode.id;
  if (!oldData || oldData.id !== newId) destData.id = newId;
  const newClass = `builtin-component-${name} node-${
    domNode.$$nodeId
  } ${domNode.className || ''}`;
  if (!oldData || oldData.class !== newClass) destData.class = newClass;
  const newStyle = domNode.style.cssText;
  if (!oldData || oldData.style !== newStyle) destData.style = newStyle;
}

// eslint-disable-next-line new-cap
Component({
  properties: {
    name: {
      type: String,
      value: '',
    },
  },
  options: {
    addGlobalClass: true, // Turn global style on
  },
  attached() {
    const nodeId = this.dataset.privateNodeId;
    const pageId = this.dataset.privatePageId;
    const data = {};

    this.nodeId = nodeId;
    this.pageId = pageId;

    // Record DOM
    this.domNode = cache.getNode(pageId, nodeId);

    // config of custom component
    const config = cache.getConfig();
    this.compConfig =
      config.runtime &&
        config.runtime.usingComponents &&
        config.runtime.usingComponents[this.domNode.behavior] ||
      {};

    // Listen on global event
    this.onSelfNodeUpdate = tool.throttle(this.onSelfNodeUpdate.bind(this));
    this.domNode.$$clearEvent('$$domNodeUpdate');
    this.domNode.addEventListener('$$domNodeUpdate', this.onSelfNodeUpdate);

    // Listen on event of custom component
    const { events = [] } = this.compConfig;
    if (events.length) {
      for (const name of events) {
        this[`on${name}`] = evt => this.callSimpleEvent(name, evt);
      }
    }

    checkComponentAttr(
      this.compConfig,
      this.domNode.behavior,
      this.domNode,
      data,
    );

    // Execute setData
    if (Object.keys(data).length) this.setData(data);
  },
  detached() {
    this.nodeId = null;
    this.pageId = null;
    this.domNode = null;
  },
  methods: {
    /**
     * Watch current node change
     */
    onSelfNodeUpdate() {
      // Judge whether  it has been destoryed
      if (!this.pageId || !this.nodeId) return;

      const newData = {};

      checkComponentAttr(
        this.compConfig,
        this.domNode.behavior,
        this.domNode,
        newData,
        this.data,
      );

      this.setData(newData);
    },

    /**
     * Trigger simple event
     */
    callSimpleEvent(eventName, evt) {
      const domNode = this.domNode;
      if (!domNode) return;

      domNode.$$trigger(eventName, {
        event: new Event({
          name: eventName,
          target: domNode,
          eventPhase: Event.AT_TARGET,
          detail: evt && evt.detail,
        }),
        currentTarget: domNode,
      });
    },
  },
});
