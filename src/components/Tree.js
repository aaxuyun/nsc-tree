import * as React from 'react';
import RcTree, { TreeNode } from 'rc-tree'
import classNames from 'classnames';
import DirectoryTree from './DirectoryTree';
import { Icon } from 'antd';
import collapseMotion from './utils/motion';
import renderSwitcherIcon from './utils/iconUtil';
import dropIndicatorRender from './utils/dropIndicator';
import './index.css'
class Tree extends React.Component {
  static defaultProps = {
    checkable: false,
    showIcon: false,
    motion: {
      ...collapseMotion,
      motionAppear: false,
    },
    blockNode: false,
  };

  renderSwitcherIcon = (
    prefixCls,
    switcherIcon,
    { isLeaf, expanded, loading },
  ) => {
    const { showLine } = this.props;
    if (loading) {
      return <Icon type="loading" className={`${prefixCls}-switcher-loading-icon`} />;
    }
    if (isLeaf) {
      return showLine ? <Icon type="file" className={`${prefixCls}-switcher-line-icon`} /> : null;
    }
    const switcherCls = `${prefixCls}-switcher-icon`;
    if (switcherIcon) {
      return React.cloneElement(switcherIcon, {
        className: classNames(switcherIcon.props.className || '', switcherCls),
      });
    }
    return showLine ? (
      <Icon
        type={expanded ? 'minus-square' : 'plus-square'}
        className={`${prefixCls}-switcher-line-icon`}
        theme="outlined"
      />
    ) : (
      <Icon type="caret-down" className={switcherCls} theme="filled" />
    );
  };


  render() {
    const {
      className,
      showIcon,
      showLine,
      switcherIcon,
      blockNode,
      children,
      checkable,
      selectable,
      virtual,
      direction
    } = this.props;
    const prefixCls = 'nsc-tree'
    const newProps = {
      ...this.props,
      showLine,
      dropIndicatorRender,
    };
    return (
      <RcTree
        itemHeight={20}
        virtual={virtual}
        {...newProps}
        prefixCls={prefixCls}
        className={classNames(
          {
            [`${prefixCls}-icon-hide`]: !showIcon,
            [`${prefixCls}-block-node`]: blockNode,
            [`${prefixCls}-unselectable`]: !selectable,
            [`${prefixCls}-rtl`]: direction === 'rtl',
          },
          className,
        )}
        direction={direction}
        checkable={checkable ? <span className={`${prefixCls}-checkbox-inner`} /> : checkable}
        selectable={selectable}
        switcherIcon={(nodeProps) =>
          renderSwitcherIcon(prefixCls, switcherIcon, showLine, nodeProps)
        }
      >
        {children}
      </RcTree>
    );
  }
}

Tree.TreeNode = TreeNode;

Tree.DirectoryTree = DirectoryTree;

Tree.defaultProps = {
  checkable: false,
  selectable: true,
  showIcon: false,
  virtual: true,
  direction: 'ltr',
  motion: {
    ...collapseMotion,
    motionAppear: false,
  },
  blockNode: false,
};

export default Tree;