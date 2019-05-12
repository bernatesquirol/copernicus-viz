import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import Immutable from 'immutable';
import {CanvasOverlay} from 'react-map-gl';

function round(x, n) {
  const tenN = Math.pow(10, n);
  return Math.round(x * tenN) / tenN;
}

const propTypes = {
  screenLocations: PropTypes.instanceOf(Immutable.List).isRequired,
  //lngLatAccessor: PropTypes.func,
  renderWhileDragging: PropTypes.bool,
  globalOpacity: PropTypes.number,
  dotRadius: PropTypes.number,
  dotFill: PropTypes.string,
  compositeOperation: PropTypes.string
};

const defaultProps = {
  //lngLatAccessor: location => [location.get(0), location.get(1)],
  renderWhileDragging: true,
  dotRadius: 4,
  dotFill: '#1FBAD6',
  globalOpacity: 1,
  // Same as browser default.
  compositeOperation: 'source-over'
};

export default class ScatterplotOverlay extends PureComponent {
  /* eslint-disable max-statements */
  _redraw = ({width, height, ctx, isDragging, project, unproject}) => {
    const {
      dotRadius,
      dotFill,
      compositeOperation,
      renderWhileDragging,
      locationsScreen,
      lngLatAccessor,
      onProjected
    } = this.props;
    const locations =  locationsScreen.map((screen)=>unproject([screen.x, screen.y]));
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = compositeOperation;
    let projected = []
    if ((renderWhileDragging || !isDragging) && locations) {
      let i = 0;
      for (let location of locations) {
        const pixel = project(location);
        projected.push(pixel)
        const pixelRounded = [round(pixel[0], 1), round(pixel[1], 1)];
        if (
          pixelRounded[0] + dotRadius >= 0 &&
          pixelRounded[0] - dotRadius < width &&
          pixelRounded[1] + dotRadius >= 0 &&
          pixelRounded[1] - dotRadius < height
        ) {
          ctx.fillStyle = dotFill;
          ctx.beginPath();
          ctx.arc(pixelRounded[0], pixelRounded[1], dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        if(i<locations.length-1){
          let first = project(locations[i]);
          let second = project(locations[i+1]);          
          ctx.beginPath(); 
          ctx.lineWidth = "5";
          ctx.strokeStyle = "white"; // Green path
          ctx.moveTo(first[0],first[1]);
          ctx.lineTo(second[0], second[1]);
          ctx.stroke(); // Draw it
          i++;
        }
        
      }
      if (onProjected) onProjected(projected)
      
    }
  };
  /* eslint-enable max-statements */

  render() {
    return <CanvasOverlay redraw={this._redraw} />;
  }
}

ScatterplotOverlay.displayName = 'ScatterplotOverlay';
ScatterplotOverlay.propTypes = propTypes;
ScatterplotOverlay.defaultProps = defaultProps;
