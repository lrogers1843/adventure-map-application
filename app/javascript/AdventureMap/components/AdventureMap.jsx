
import PropTypes from 'prop-types';
import React from 'react';
import Flatpickr from "react-flatpickr";
import 'flatpickr/dist/themes/dark.css';
import PhotoScroller from './PhotoScroller.jsx';
import MapBox from './MapBox.jsx';

export default class AdventureMap extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired, // this is passed from the Rails view
  };
  /**
   * @param props - Comes from your rails view.
   */
  constructor(props) {
    super(props);

    // How to set initial state in ES6 class syntax
    // https://reactjs.org/docs/state-and-lifecycle.html#adding-local-state-to-a-class
  
    this.state = { 
      start_date: this.props.start_date,
      end_date: this.props.end_date,
      activities: this.props.activities,
      geojson: this.props.geojson,
      types: this.props.types,
      zoom_coords: this.props.zoom_coords,
      map_style: this.props.map_style,
      activity_type: "",
    };
    console.log(this.props)
    console.log("constructor end")
  }
  
  getActivities() {

    var data = (({ start_date, end_date, activity_type }) => ({ start_date, end_date, activity_type }))(this.state);
    console.log("getting activities")
    console.log(data)

    fetch("/activities/filter", {
      method: 'POST',
      headers:  {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then( (json) => {
      this.setState({
        activities: json[1],
        geojson: json[0], 
        types: json[2],
        zoom_coords: json[3],
      })
      console.log("fetch end")
      console.log(json);
    });
  }

  zoomIn = (e) => {
    console.log("zoom")
    e.preventDefault()
    this.mapbox.zoomIn(e)
  }
  
  updateStartdate = (start_date) => {
    this.setState({ start_date }, this.getActivities );
  };
  
  updateEnddate = (end_date) => {
    this.setState({ end_date }, this.getActivities );
  };

  updateStyle = (e) => {
    this.setState({ map_style: e.target.value });
  };

  changeStyle() {
    this.state.map.setStyle('mapbox://styles/' + this.state.map_style)
  }

  displaySelected(e, onActivitySelectedProps) {
    this.setState(onActivitySelectedProps, this.photosCall())
  }

  removeSelected(e) {
    this.setState({display_props: null, photo_data: null})
  }

  photosCall = (e) => {
    console.log("api")

    // refresh token
    fetch("/users/refresh_google_token", {
      method: 'POST',
      headers:  {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    })
    .then(response => response.json())
    .then( (json) => {
      this.setState({
        google_token: json[0]
      }, this.getPhotos)
    })
  }

  getPhotos() {
    // console.log(this.state.activity_props)

    var data = {
      'activity_id': this.state.activity_props.aid
    }

    fetch("/activities/detailed_activity", {
      method: 'POST',
      headers:  {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then( (json) => this.setState({time_coords: json[0]}, console.log("coords set")))


    var date = new Date(this.state.activity_datetime)
    // console.log(this.state.activity_datetime)

    var body = {
      "pageSize": "100",
      "filters": {
        "mediaTypeFilter": {
          "mediaTypes": [
            "PHOTO"
          ]
        },
        "dateFilter": {
          "dates": [
            {
              "year": date.getFullYear(),
              "month": date.getMonth() + 1,
              "day": date.getDate()
            }
          ]
        }
      }
    }  

    // console.log(body)

    fetch("https://photoslibrary.googleapis.com/v1/mediaItems:search", {
      method: 'POST',
      headers:  {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + this.state.google_token
      },
      body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then( (json) => { 
      this.filterPhotosByTime(json)
    });
  }

  filterPhotosByTime(photos) {
    // console.log(photos.mediaItems)
    
    // console.log(photos.mediaItems[0].mediaMetadata.creationTime)
    console.log(this.state.activity_datetime)
    console.log(this.state.activity_endtime)

    var filtered_photos = photos.mediaItems.filter((picture) => {
      return new Date(picture.mediaMetadata.creationTime) >= new Date(this.state.activity_datetime) &&
             new Date(picture.mediaMetadata.creationTime) <= new Date(this.state.activity_endtime)
    });
    console.log(filtered_photos)
    this.pushDataToState(filtered_photos)

    // var arr = [
    //   {
    //     'a': 1,
    //     'b': 2
    // }, {
    //   'a': 1,
    //   'b': 5
    // }]
    // console.log(arr)

    // var result = arr.filter( (el) => {
    //   return el.a > 0 &&
    //   el.b < 5
    // })
    // console.log(result)
  }

  pushDataToState(photos) {
    var photo_data = photos.map( (p) => [p.baseUrl + "=w250-h500", p.mediaMetadata.creationTime] )

    this.setState({photo_data: photo_data}, console.log(this.state))
  }

  render() {
    return (
      <>
      <div>
        <MapBox 
        geojson={this.state.geojson} 
        map_style={this.state.map_style} 
        zoom_coords={this.state.zoom_coords}
        onActivitySelected={this.displaySelected.bind(this)} 
        onActivityDeselected={this.removeSelected.bind(this)} 
        ref={(mapbox)=>{this.mapbox = mapbox}}/>

        <div ref={el => this.navbar = el} className="navbar flex flex-col font-semibold">
        <div>
          <form className="flex flex-col items-left">
            Start Date
            <Flatpickr
            className=""
            value={this.state.start_date}
              options={{
                dateFormat:"n/j/Y",
              }}
              onChange={(e) => {
                this.updateStartdate(e[0])
              }}
            />
            <br></br>
            <p>End Date</p>
            <Flatpickr
            className=""
            value={this.state.end_date} 
              options={{
                dateFormat:"n/j/Y",
              }}
              onChange={(e) => {
                this.updateEnddate(e[0])
              }}
            />
            <br></br>
            <p>Activity Type</p>
            <div>
              <select 
              className=""
              value={this.state.activity_type}
              onChange={(e) => {
                this.setState({activity_type: e.target.value}, this.getActivities );
              }
              }
              >
                {this.state.types.map((type) => <option key={type.value} value={type.value}>{type.display}</option>)}
              </select>
            </div>
            <br></br>
            <div>
            <p>Map Style</p>
            <label>
              <input
                type="radio"
                value="mapbox/outdoors-v11"
                checked={this.state.map_style === "mapbox/outdoors-v11"}
                onChange={this.updateStyle}
              />
              Outdoors
            </label>
            <br></br>
            <label>
              <input
                type="radio"
                value="mapbox/streets-v11"
                checked={this.state.map_style === "mapbox/streets-v11"}
                onChange={this.updateStyle}
              />
              Streets
            </label>
            <br></br>
            <label>
              <input
                type="radio"
                value="mapbox/satellite-v9"
                checked={this.state.map_style === "mapbox/satellite-v9"}
                onChange={this.updateStyle}
              />
              Satellite
            </label>
            <br></br>
            <label>
              <input
                type="radio"
                value="mapbox/dark-v10"
                checked={this.state.map_style === "mapbox/dark-v10"}
                onChange={this.updateStyle}
              />
              Dark
            </label>
            <br></br>
            <label>
              <input
                type="radio"
                value="lrogers1843/ckbk7v2o50i1a1imy25jyqnzf"
                checked={this.state.map_style === "lrogers1843/ckbk7v2o50i1a1imy25jyqnzf"}
                onChange={this.updateStyle}
              />
              Pencil
            </label>
            <br></br>
            <label>
              <input
                type="radio"
                value="lrogers1843/ckby3o0b81vlg1io6gtci8zx6"
                checked={this.state.map_style === "lrogers1843/ckby3o0b81vlg1io6gtci8zx6"}
                onChange={this.updateStyle}
              />
              Treasure
            </label>
            <br></br>
            </div>
            <br></br>

            <br></br>

            <p>Zoom to Displayed Activities</p>
            <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow" onClick={this.zoomIn}>Zoom</button>
          </form>
        </div>
      </div>
      <PhotoScroller 
      data={this.state.photo_data} 
      display_props={this.state.display_props}
      time_coords={this.state.time_coords} 
      activity_start={this.state.activity_datetime}        
      />
      </div>
      </>
    )
  }
}