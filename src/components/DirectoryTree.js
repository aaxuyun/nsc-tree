import * as React from 'react';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import { conductExpandParent } from 'rc-tree/lib/util';
import { convertDataToEntities, convertTreeToData } from 'rc-tree/lib/utils/treeUtil';
import { Icon } from 'antd'
import Tree from './Tree';
import { calcRangeKeys, convertDirectoryKeysToNodes } from './utils/dictUtil';
import { omit } from 'lodash';

function getIcon(props) {
  const { isLeaf, expanded } = props;
  if (isLeaf) {
    return <Icon type="file" />;
  }
  return <Icon type={expanded ? 'folder-open' : 'folder'} />;
}

function getTreeData({ treeData, children }) {
  return treeData || convertTreeToData(children);
}
class DirectoryTree extends React.Component {
  static defaultProps = {
    showIcon: true,
    expandAction: 'click',
  };

  static getDerivedStateFromProps(nextProps) {
    const newState = {};
    if ('expandedKeys' in nextProps) {
      newState.expandedKeys = nextProps.expandedKeys;
    }
    if ('selectedKeys' in nextProps) {
      newState.selectedKeys = nextProps.selectedKeys;
    }
    return newState;
  }

  constructor(props) {
    super(props);
    // Selected keys
    this.state = {
      selectedKeys: props.selectedKeys || props.defaultSelectedKeys || [],
      expandedKeys: this.getInitExpandedKeys()
    };

  }
  getInitExpandedKeys = () => {
    const { defaultExpandAll, defaultExpandParent, defaultExpandedKeys, ...restProps } = this.props
    const { keyEntities } = convertDataToEntities(getTreeData(restProps));

    let initExpandedKeys = [];

    // Expanded keys
    if (defaultExpandAll) {
      initExpandedKeys = Object.keys(keyEntities);
    } else if (defaultExpandParent) {
      initExpandedKeys = conductExpandParent(
        restProps.expandedKeys || defaultExpandedKeys || [],
        keyEntities,
      );
    } else {
      initExpandedKeys = restProps.expandedKeys || defaultExpandedKeys;
    }
    return initExpandedKeys;
  };

  expandFolderNode = (event, node) => {
    const { isLeaf } = node.props;

    if (isLeaf || event.shiftKey || event.metaKey || event.ctrlKey) {
      return;
    }

    // Get internal rc-tree
    const internalTree = this.tree.tree;

    // Call internal rc-tree expand function
    // https://github.com/ant-design/ant-design/issues/12567
    internalTree.onNodeExpand(event, node);
  };

  onDebounceExpand = debounce(this.expandFolderNode, 200, {
    leading: true,
  });

  setUncontrolledState = (state) => {
    const newState = omit(state, Object.keys(this.props));
    if (Object.keys(newState).length) {
      this.setState(newState);
    }
  }

  onExpand = (
    keys,
    info
  ) => {
    const { onExpand } = this.props;
    if (!('expandedKeys' in this.props)) {
      this.setUncontrolledState({ expandedKeys: keys });
    }
    // Call origin function
    if (onExpand) {
      return onExpand(keys, info);
    }

    return undefined;
  };

  onClick = (event, node) => {
    const { expandAction, onClick } = this.props;

    // Expand the tree
    if (expandAction === 'click') {
      this.onDebounceExpand(event, node);
    }

    if (onClick) {
      onClick(event, node);
    }
  };

  onDoubleClick = (event, node) => {
    const { expandAction, onDoubleClick } = this.props;

    // Expand the tree
    if (expandAction === 'doubleClick') {
      this.onDebounceExpand(event, node);
    }

    if (onDoubleClick) {
      onDoubleClick(event, node);
    }
  };

  onSelect = (
    keys,
    event
  ) => {
    const { multiple, onSelect } = this.props;
    const { expandedKeys } = this.state;
    const { node, nativeEvent } = event;
    const { key = '' } = node;

    const treeData = getTreeData(this.props);
    // const newState: DirectoryTreeState = {};

    // We need wrap this event since some value is not same
    const newEvent = {
      ...event,
      selected: true, // Directory selected always true
    };

    // Windows / Mac single pick
    const ctrlPick = nativeEvent.ctrlKey || nativeEvent.metaKey;
    const shiftPick = nativeEvent.shiftKey;

    // Generate new selected keys
    let newSelectedKeys
    if (multiple && ctrlPick) {
      // Control click
      newSelectedKeys = keys;
      this.lastSelectedKey = key;
      this.cachedSelectedKeys = newSelectedKeys;
      newEvent.selectedNodes = convertDirectoryKeysToNodes(treeData, newSelectedKeys);
    } else if (multiple && shiftPick) {
      // Shift click
      newSelectedKeys = Array.from(
        new Set([
          ...(this.cachedSelectedKeys || []),
          ...calcRangeKeys({
            treeData,
            expandedKeys,
            startKey: key,
            endKey: this.lastSelectedKey,
          }),
        ]),
      );
      newEvent.selectedNodes = convertDirectoryKeysToNodes(treeData, newSelectedKeys);
    } else {
      // Single click
      newSelectedKeys = [key];
      this.lastSelectedKey = key;
      this.cachedSelectedKeys = newSelectedKeys;
      newEvent.selectedNodes = convertDirectoryKeysToNodes(treeData, newSelectedKeys);
    }
    if (onSelect) {
      onSelect(newSelectedKeys, newEvent);
    }

    this.setUncontrolledState({ selectedKeys: newSelectedKeys });
  };

  render() {
    const { prefixCls: customizePrefixCls, className, direction, ...otherProps } = this.props;
    const { expandedKeys, selectedKeys } = this.props;
    const prefixCls = 'ant-tree'
    const connectClassName = classNames(
      `${prefixCls}-directory`,
      className,
    );
    return (
      <Tree
        icon={getIcon}
        ref={r => this.tree = r}
        blockNode
        {...otherProps}
        prefixCls={prefixCls}
        className={connectClassName}
        expandedKeys={expandedKeys}
        selectedKeys={selectedKeys}
        onSelect={this.onSelect}
        onClick={this.onClick}
        onDoubleClick={this.onDoubleClick}
        onExpand={this.onExpand}
      />
    );
  }
};

export default DirectoryTree