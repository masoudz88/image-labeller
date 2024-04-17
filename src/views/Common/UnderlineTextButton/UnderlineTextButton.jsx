import React from 'react'
import classNames from 'classnames'
import './UnderlineTextButton.scss'

export const UnderlineTextButton = (props) => {
  const { under, over, active, key, label, onClick, style } = props;

  const getClassName = () => {
    return classNames('UnderlineTextButton', {
      under: under,
      over: over,
      active: active,
    });
  };

  return (
    <div
      className={getClassName()}
      onClick={!!onClick ? onClick : undefined}
      key={key}
      style={style}>
      {label}
    </div>
  );
};
