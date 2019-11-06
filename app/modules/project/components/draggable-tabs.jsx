/**
 * Copyright (c) 2014-present PlatformIO <contact@platformio.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DndProvider, DragSource, DropTarget } from 'react-dnd';

import HTML5Backend from 'react-dnd-html5-backend';
import PropTypes from 'prop-types';
import React from 'react';
import { Tabs } from 'antd';

// Drag & Drop node
class TabNode extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node])
      .isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired
  };

  render() {
    return this.props.connectDragSource(
      this.props.connectDropTarget(this.props.children)
    );
  }
}

const cardTarget = {
  drop(props, monitor) {
    const dragKey = monitor.getItem().index;
    const hoverKey = props.index;

    if (dragKey === hoverKey) {
      return;
    }

    props.moveTabNode(dragKey, hoverKey);
    monitor.getItem().index = hoverKey;
  }
};

const cardSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index
    };
  }
};

const WrapTabNode = DropTarget('DND_NODE', cardTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))(
  DragSource('DND_NODE', cardSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }))(TabNode)
);

export class DraggableTabs extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node])
      .isRequired,
    onOrderChange: PropTypes.func
  };

  constructor(...args) {
    super(...args);
    this.state = {
      order: []
    };
  }

  moveTabNode = (dragKey, hoverKey) => {
    const oldOrder = this.state.order;
    const newOrder = oldOrder.slice();
    const { children } = this.props;

    React.Children.forEach(children, c => {
      if (newOrder.indexOf(c.key) === -1) {
        newOrder.push(c.key);
      }
    });

    const dragIndex = newOrder.indexOf(dragKey);
    const hoverIndex = newOrder.indexOf(hoverKey);

    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, dragKey);

    this.setState({
      order: newOrder
    });
    if (this.props.onOrderChange) {
      this.props.onOrderChange(newOrder, oldOrder);
    }
  };

  renderTabBar = (props, DefaultTabBar) => (
    <DefaultTabBar {...props}>
      {node => (
        <WrapTabNode key={node.key} index={node.key} moveTabNode={this.moveTabNode}>
          {node}
        </WrapTabNode>
      )}
    </DefaultTabBar>
  );

  render() {
    const { order } = this.state;
    const { children } = this.props;

    const tabs = [];
    React.Children.forEach(children, c => {
      tabs.push(c);
    });

    const orderTabs = tabs.slice().sort((a, b) => {
      const orderA = order.indexOf(a.key);
      const orderB = order.indexOf(b.key);

      if (orderA !== -1 && orderB !== -1) {
        return orderA - orderB;
      }
      if (orderA !== -1) {
        return -1;
      }
      if (orderB !== -1) {
        return 1;
      }

      const ia = tabs.indexOf(a);
      const ib = tabs.indexOf(b);

      return ia - ib;
    });

    return (
      <DndProvider backend={HTML5Backend}>
        <Tabs renderTabBar={this.renderTabBar} {...this.props}>
          {orderTabs}
        </Tabs>
      </DndProvider>
    );
  }
}
