import React from 'react'


export default class PhotoView extends React.Component {
    render() {
        if (this.props.display) {
          return  <div 
          className="absolute z-10 h-full w-full top-0 left-0 flex content-center justify-center items-center bg-opacity-75 bg-black"
          onClick={() => this.props.toggleLargePhoto("")}
          >
            <img
            className="max-h-full max-w-full" 
            // style={{maxWidth: 'inherit', maxHeight: 'inherit'}}
            src={this.props.url} 
            />
          </div>
        }
        return null;
    }
}