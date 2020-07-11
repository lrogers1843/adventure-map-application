import PropTypes from 'prop-types';

import React from 'react';


export default class PhotoScroller extends React.Component {
    render() {
        if (this.props.activity_props) {
                var keys = Object.keys(this.props.activity_props)
                return <div 
                className="photo_scroller flex flex-col items-center overflow-y-auto text-sm text-black font-semibold">
                {keys.map( (k) => <p> {k + ": " + this.props.activity_props[k]}</p>)}
                {this.props.toShow && this.props.toShow.map( (l) => <img src={l}/>)} 
                </div>
              }
              return null;
    }
  }