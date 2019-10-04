
import { Breadcrumb, Icon, Spin, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';


const LOCAL_STORAGE_KEY = 'inspect-json';
const PARENT_DIR = '..';
const ROOT_PATH = '';
const PARENT_DIR_NODE = { name: PARENT_DIR, path: PARENT_DIR };

function splitPath(path) {
  if (path === ROOT_PATH) {
    return [];
  }

  const segments = path.split('/');
  if (path[0] === '/') {
    segments.shift();
  }
  if (segments[0].substr(-1) === ':') {
    // Fix Windows drive letter
    segments[0] = segments[0].toUpperCase();
  }
  return segments;
}

function getTreeNodeByPath(root, path_str, createIfNotExists = false) {
  const path = splitPath(path_str);
  const len = path.length;
  if (!len) {
    return root;
  }
  let current = root;
  for (let i = 0; i < len; i++) {
    const children = current.children || (current.children = []);
    const segment_name = path[i];
    let segment = current.children.find(x => x.name == segment_name);
    if (!segment) {
      if (!createIfNotExists) {
        throw new Error(`Not existing tree path '${path_str}'`);
      }
      segment = {
        name: segment_name,
        path: path.slice(0, i+1).join('/')
      };
      children.push(segment);
    }
    if (i === len - 1) {
      return segment;
    } else {
      current = segment;
    }
  }
}

function insertTreeLeafByPath(root, path, item) {
  const segment = getTreeNodeByPath(root, path, true);
  if (segment.item) {
    throw new Error(`Can not replace already existing tree node at '${path}'`);
  }
  segment.item = item;
  return segment;
}

function createRootNode() {
  return {
    name: ROOT_PATH,
    path: ROOT_PATH,
    children: []
  };
}

function createTreeFromList(list) {
  const root = createRootNode();
  const len = list.length;
  for (let i = 0; i < len; i++) {
    const item = list[i];
    insertTreeLeafByPath(root, item.name, item);
    // const { symbols = [] } = item
    // for (let j = 0; j < symbols.length; j++) {
    //   const symbol = symbols[j]
    //   const segments = splitPath(symbol.location)
    //   const [ file, line ] = segments.pop().split(":", 2)
    //   segments.push(file, `#${line}-${j}`)
    //   insertTreeLeafByPath(root, segments.join('/'), symbol)
    // }
  }
  return root;
}

function getTreeNodesAtPath(root, path) {
  const node = getTreeNodeByPath(root, path);
  if (!node) {
    return [];
  }
  return (node.children || []).map((x) => flattenSingleChild(x));
}

function flattenSingleChild(node) {
  if (node.item || !node.children) {
    return node;
  }
  const names = [node.name];
  let currentNode = node;
  while (currentNode.children && currentNode.children.length === 1) {
    currentNode = currentNode.children[0];
    names.push(currentNode.name);
  }
  return {...currentNode, name: names.join('/')};
}

function getNodeWithFlatChildren(node) {
  return [node, ...getNodeFlatChildren(node)];
}

function getNodeFlatChildren(node) {
  const result = [];
  const len = node.children ? node.children.length : 0;

  for (let i = 0; i < len; i++) {
    const child = node.children[i];
    result.push(child);
    if (child.children && child.children.length) {
      result.push(...getNodeFlatChildren(child));
    }
  }
  return result;
}

function compareTreeNodeType(a, b) {
  const fileA = a.children ? 0 : 1;
  const fileB = b.children ? 0 : 1;
  return fileA - fileB;
}

class InspectExplorerPage extends React.PureComponent {

  constructor(...args) {
    super(...args);

    this.state = {
      json: '{}',
      tree: createTreeFromList([]),
      path: ROOT_PATH
    };
  }

  componentDidMount() {
    this.loadJson(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
  }

  loadJson(json) {
    const data = JSON.parse(json) || {};
    const { memory: { files = {} } = {} } = data;
    const list = Object.entries(files).map(([name, item]) => ({...item, name}));
    const tree = createTreeFromList(list);

    this.setState(() => ({
      json,
      tree
    }));
  }

  getTableColumns() {
    return [
      {
        title: '',
        dataIndex: 'children',
        render: (children) => <Icon type={children ? 'folder-open' : 'file-text'}/>,
        // 14px icon + 8px*2 padding
        width: 30
      },
      {
        title: 'Name',
        dataIndex: 'name',
        render: (name, node) => {
          if (node.children || name == PARENT_DIR) {
            return (<a onClick={() => this.setCurrentPath(node.path)}>{node.name}</a>);
          } else {
            return node.name;
          }

        }
      },
      {
        title: 'Flash Size',
        dataIndex: 'item.flash_size',
        render: (_size, node) => getNodeWithFlatChildren(node)
          .reduce((total, child) => total + (child.item ? child.item.flash_size : 0), 0),
        width: 100
      },
      {
        title: 'RAM Size',
        dataIndex: 'item.ram_size',
        render: (_size, node) => getNodeWithFlatChildren(node)
          .reduce((total, child) => total + (child.item ? child.item.ram_size : 0), 0),
        width: 100
      }
    ];
  }

  setCurrentPath = (path) => {
    this.setState(() => ({
      path: path === PARENT_DIR ? this.getParentPath() : path
    }));
  }


  getParentPath() {
    return splitPath(this.state.path).slice(0, -1).join('/');
  }

  handleTextAreaChange = (e) => {
    const json = e.target.value;
    localStorage.setItem(LOCAL_STORAGE_KEY, json);
    this.loadJson(json);
  }

  render() {
    const { json, path } = this.state;
    return (
      <div className='page-container'>
        <Breadcrumb>
          <Breadcrumb.Item key={0} >
            <a
              title={'/'}
              onClick={() => this.setCurrentPath(ROOT_PATH)}
            >
              <Icon type="book"/>
            </a>
          </Breadcrumb.Item>
          {
            splitPath(path)
              .map((name, i, segments) => (
                <Breadcrumb.Item key={i+1}>
                  <a
                    onClick={() => this.setCurrentPath(segments.slice(0, i+1).join('/'))}
                  >{name}</a>
                </Breadcrumb.Item>))
          }
        </Breadcrumb>
        { this.renderList() }
        <textarea style={{marginTop: 20}} rows="10" cols="80"
          onChange={this.handleTextAreaChange}
          value={json}></textarea>
      </div>
      );
  }

  onRowClick = (e) => {
    const tr = e.target.closest('tr');
    if (!tr) {
      return;
    }
    const newPath = tr.dataset.rowKey;
    const { tree } = this.state;
    if (newPath == PARENT_DIR) {
      this.setCurrentPath(this.getParentPath());
      return;
    }

    const node = getTreeNodeByPath(tree, newPath);
    if (!node || !node.children) {
      return;
    }
    this.setCurrentPath(newPath);
   }

  renderList() {
    const { tree, path } = this.state;
    const items = (path.length ? [PARENT_DIR_NODE] : [])
      .concat(getTreeNodesAtPath(tree, path).sort((a,b) => {
        const dirCmp = compareTreeNodeType(a, b);
        if (dirCmp == 0) {
          return a.name.localeCompare(b.name);
        }
        return dirCmp;
      }));

    if (!items) {
      return (
        <div className='text-center'>
          <Spin tip='Loading...' size='large' />
        </div>
        );
    }
    if (items.length === 0) {
      return (
        <ul className='background-message text-center'>
          <li>
            No Items
          </li>
        </ul>
        );
    }

    return (<Table
        childrenColumnName='_'
        columns={ this.getTableColumns() }
        dataSource={items}
        onRow={() => ({ onClick: this.onRowClick })}
        pagination={false}
        rowKey='path'
        size='middle'
        />
      );
  }
}

// Redux

function mapStateToProps() {
  return {
    items: []
  };
}

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(InspectExplorerPage);
