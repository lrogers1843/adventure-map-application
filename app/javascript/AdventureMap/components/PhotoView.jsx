import React from 'react'


export default class PhotoView extends React.Component {
    render() {
        if (this.props.display) {
          return  <div className="absolute z-10 w-full h-full top-0 left-0 flex content-center justify-center items-center bg-opacity-75 bg-black">
            <img className="max-w-full max-h-full" 
            src={this.props.url} 
            onClick={() => this.props.toggleLargePhoto("")}
            />
          </div>
        }
        return null;
    }
}