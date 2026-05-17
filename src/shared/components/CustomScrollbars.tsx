import React, { forwardRef, useCallback } from 'react';
import { Scrollbars } from "react-custom-scrollbars-2";

import "./CustomScrollbars.scss";

interface ICustomScrollbarsProps {
  className?: string;
  style?: React.CSSProperties;
  disableVerticalScroll?: boolean;
  disableHorizontalScroll?: boolean;
  quickScroll?: boolean;
  autoHeight?: boolean;
  autoHeightMin?: number;
  autoHeightMax?: number;
  children?: React.ReactNode;
}

// Chuyển sang Function Component + Hooks
const CustomScrollbars = forwardRef<Scrollbars, ICustomScrollbarsProps>(({
  className,
  disableVerticalScroll,
  disableHorizontalScroll,
  quickScroll,
  children,
  ...otherProps
}, ref) => {

  const renderTrackHorizontal = useCallback((props: any) => (
    <div {...props} className="track-horizontal" />
  ), []);
  const renderTrackVertical = useCallback((props: any) => (
    <div {...props} className="track-vertical" />
  ), []);
  const renderThumbHorizontal = useCallback((props: any) => (
    <div {...props} className="thumb-horizontal" />
  ), []);
  const renderThumbVertical = useCallback((props: any) => (
    <div {...props} className="thumb-vertical" />
  ), []);
  const renderNone = useCallback(() => <div />, []);

  return (
    <Scrollbars
      ref={ref}
      autoHide={true}
      autoHideTimeout={200}
      hideTracksWhenNotNeeded={true}
      className={
        className ? className + " custom-scrollbar" : "custom-scrollbar"
      }
      {...otherProps}
      renderTrackHorizontal={
        disableHorizontalScroll ? renderNone : renderTrackHorizontal
      }
      renderTrackVertical={
        disableVerticalScroll ? renderNone : renderTrackVertical
      }
      renderThumbHorizontal={
        disableHorizontalScroll ? renderNone : renderThumbHorizontal
      }
      renderThumbVertical={
        disableVerticalScroll ? renderNone : renderThumbVertical
      }
    >
      {children}
    </Scrollbars>
  );
});

CustomScrollbars.displayName = "CustomScrollbars";

export default CustomScrollbars;
