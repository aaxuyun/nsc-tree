import * as React from 'react';
import classNames from 'classnames';
import { Icon } from 'antd'
import { isValidElement, cloneElement } from './reactNode';

export default function renderSwitcherIcon(
  prefixCls,
  switcherIcon,
  showLine,
  { isLeaf, expanded, loading },
) {
  if (loading) {
    return <Icon className={`${prefixCls}-switcher-loading-icon`} type='loading' />;
  }
  let showLeafIcon;
  if (showLine && typeof showLine === 'object') {
    showLeafIcon = showLine.showLeafIcon;
  }
  if (isLeaf) {
    if (showLine) {
      if (typeof showLine === 'object' && !showLeafIcon) {
        return <span className={`${prefixCls}-switcher-leaf-line`} />;
      }
      return <Icon type='file' className={`${prefixCls}-switcher-line-icon`} />;
    }
    return null;
  }
  const switcherCls = `${prefixCls}-switcher-icon`;
  if (isValidElement(switcherIcon)) {
    return cloneElement(switcherIcon, {
      className: classNames(switcherIcon.props.className || '', switcherCls),
    });
  }

  if (switcherIcon) {
    return switcherIcon;
  }

  if (showLine) {
    return expanded ? (
      <Icon type="minus-square" className={`${prefixCls}-switcher-line-icon`} />
    ) : (
      <Icon type="plus-square" className={`${prefixCls}-switcher-line-icon`} />
    );
  }
  return <Icon type="caret-down"  className={switcherCls} />;
}