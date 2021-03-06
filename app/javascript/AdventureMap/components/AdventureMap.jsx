
import PropTypes from 'prop-types';
import React from 'react';
import Flatpickr from "react-flatpickr";
import 'flatpickr/dist/themes/dark.css';
import PhotoScroller from './PhotoScroller.jsx';
import MapBox from './MapBox.jsx';
import PhotoView from './PhotoView.jsx';
import Instructions from './Instructions.jsx';

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
      types: [{value: "", display: "All"}],
      map_style: "mapbox/outdoors-v11",
      activity_type: "",
      marker_coords: [],
      large_photo: [false, ""],
      instructions: true,
      photo_data: null,
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
        flags: json[4]
      }, console.log(json))
      console.log("fetch end")
     
    });
  }

  componentDidMount() {
    console.log("initial activities")
    //today's date
    var end_date = new Date()
    this.updateEnddate(end_date)
  }

  zoomIn = (e) => {
    console.log("zoom")
    e.preventDefault()
    this.mapbox.zoomIn(this.state.zoom_coords)
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

  googleReAuth() {
    fetch("/users/google_reauth", {
      method: 'POST',
      headers:  {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    })
    .then(response => response.json())
    .then(json => {
      alert(json['message'])
      window.location = json['redirect_url']      

    })
  }

  stravaReAuth() {
    fetch("/users/strava_reauth", {
      method: 'POST',
      headers:  {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    })
    .then(response => response.json())
    .then(json => {
      alert(json['message'])
      window.location = json['redirect_url']      

    })
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
    .then(response => {
      var json = response.json()
      console.log(!response.ok)
      if (!response.ok) { this.googleReAuth() }
      else { return json }
    })
    .then( (json) => {
      this.setState({
        google_token: json[0]
      }, this.getPhotos)   
    })
  }

  getPhotos() {
    // console.log(this.state.activity_props)
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
    .then(response => {
      var json = response.json()
      console.log(!response.ok)
      if (!response.ok) { this.googleReAuth() }
      else { return json }
    })
    .then( (json) => { 
      this.filterPhotosByTime(json)
    });
  }

  getDetailedActivity(filtered_photos) {
    console.log("detailed activity")
    var data = {
      'activity_id': this.state.activity_props.aid
    }
    //this calls strava api, which has rate limit of 100 times/15min. so ony tiggering if there are photos to map
    fetch("/activities/detailed_activity", {
      method: 'POST',
      headers:  {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(data)
    })

    .then(response => {
      var json = response.json()
      if (!response.ok) { this.stravaReAuth() }
      else { return json }
    })
    .then( (json) => this.setState({time_coords: json[0]}, this.pushDataToState(filtered_photos)))

  }

  filterPhotosByTime(photos) {
    console.log("filter")
    console.log(photos)

    var filtered_photos = null

    if (photos.mediaItems) {
      filtered_photos = photos.mediaItems.filter((picture) => {
        return new Date(picture.mediaMetadata.creationTime) >= new Date(this.state.activity_datetime) &&
               new Date(picture.mediaMetadata.creationTime) <= new Date(this.state.activity_endtime)
      });
    }

    if (filtered_photos && filtered_photos.length == 0) {
      filtered_photos = null
    }

    if (filtered_photos) {
      this.getDetailedActivity(filtered_photos)
    }    
  }

  pushDataToState(photos) {
  var photo_data = null

    class Photo {
      constructor(id, url, timestamp, hovered) {
        this.id = id;
        this.url = url;
        this.timestamp = timestamp;
        this.hovered = hovered;
      }

      setCoordinates(c) {
        this.coords = c
      }

    }
    if (photos) {
      photo_data = photos.map( (p) => new Photo( p.id, p.baseUrl + "=w250-h500", p.mediaMetadata.creationTime, false ) )
      this.setState({photo_data}, console.log(this.state))
    }
  }

  toggleMarkerOn(coords) {
    var marker_coords = this.state.marker_coords
    marker_coords = [...marker_coords, coords]
    this.setState({marker_coords}, console.log("added marker"))
  }

  toggleMarkerOff() {
    var marker_coords = []
    this.setState({marker_coords}, console.log(this.state.marker_coords))
  }

  toggleLargePhoto(url) {
    url = url.replace("=w250-h500", "=w5000-h5000")
    console.log("toggle")
    if (this.state.large_photo[0] == true) {
      this.setState({large_photo:[false,""]})
    }
    if (this.state.large_photo[0] == false) {
      this.setState({large_photo:[true, url]})
    }
  }

  toggleInstructions() {
    if (this.state.instructions == true) {
      this.setState({instructions: false})
    }
    if (this.state.instructions == false) {
      this.setState({instructions: true})
    }
  }

  setActivityType(activity_type) {
    this.setState({activity_type}, this.getActivities )
  }

  zoomToSelected() {
    this.mapbox.zoomToSelected()
  }

  render() {
    return (
      <>
      <div>
        <Instructions
        display={this.state.instructions}
        toggleInstructions={this.toggleInstructions.bind(this)}
        />
        <MapBox 
          geojson={this.state.geojson}
          flags={this.state.flags}
          map_style={this.state.map_style} 
          zoom_coords={this.state.zoom_coords}
          onActivitySelected={this.displaySelected.bind(this)} 
          onActivityDeselected={this.removeSelected.bind(this)}
          marker_coords={this.state.marker_coords}
          time_coords={this.state.time_coords}  
          ref={(mapbox)=>{this.mapbox = mapbox}}
        />

        <div ref={el => this.navbar = el} className="navbar theme-background ">
            <form className="flex flex-col items-center text-s font-semibold justify-between h-full w-full">
              <div className="text-center">
              <p>Start Date</p>
              <Flatpickr
              className="w-full"
              value={this.state.start_date}
                options={{
                  dateFormat:"n/j/Y",
                }}
                onChange={(e) => {
                  this.updateStartdate(e[0])
                }}
              />
              </div>
              <div className="text-center">
              <p>End Date</p>
              <Flatpickr
              className="w-full"
              value={this.state.end_date} 
                options={{
                  dateFormat:"n/j/Y",
                }}
                onChange={(e) => {
                  this.updateEnddate(e[0])
                }}
              />
              </div>
              
              <div className="text-left w-full">
                <p className="text-center">Activity Type</p>
                {/* <select 
                className="w-full"
                value={this.state.activity_type}
                onChange={(e) => {
                  this.setActivityType(e.target.value)
                }
                }
                >
                  {this.state.types.map((type) => 
                  <option key={type.value} value={type.value}>{type.display}</option>)}
                </select> */}

                <div className="text-left font-normal">
                  {this.state.types.map((type) =>
                  <>
                  <label>
                    <input
                      type="radio"
                      value={type.value}
                      checked={this.state.activity_type === type.value}
                      onChange={(e) => this.setActivityType(e.target.value)}
                    />
                    {type.display}
                  </label>
                  <br></br>
                  </>)}
                </div>
              </div>

              <div className="text-left w-full">
              <p className="text-center">Map Style</p>

                <div className="text-left font-normal">
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
                <label>
                  <input
                    type="radio"
                    value="lrogers1843/ckcpcaxcl0bk11kobtsx67g9n"
                    checked={this.state.map_style === "lrogers1843/ckcpcaxcl0bk11kobtsx67g9n"}
                    onChange={this.updateStyle}
                  />
                  Comic
                </label>
                </div>
              </div>
              <div className="text-center">
              <button className="outline-none bg-white hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow" 
              onClick={this.zoomIn}>Zoom To All</button>
              <button className="invisible font-semibold py-2 px-4 " onClick={e => e.preventDefault}>Dummy Spacer</button>
              {/* can't create a link with post/delet methods, those are always get unless treated specially */}
              {this.props.demo && <a rel="nofollow" href="/">Home</a>}
              {!this.props.demo && <a rel="nofollow" href="/users/sign_out" data-method="delete">Sign Out</a>}
              </div>
            </form>
        </div>
      <PhotoScroller 
        data={this.state.photo_data} 
        display_props={this.state.display_props}
        time_coords={this.state.time_coords} 
        activity_start={this.state.activity_datetime}    
        toggleMarkerOn={this.toggleMarkerOn.bind(this)}
        toggleMarkerOff={this.toggleMarkerOff.bind(this)}
        toggleLargePhoto={this.toggleLargePhoto.bind(this)}
        zoomIn={this.zoomToSelected.bind(this)}
      />
      < PhotoView
        display={this.state.large_photo[0]}
        url={this.state.large_photo[1]}
        toggleLargePhoto={this.toggleLargePhoto.bind(this)}
      />
      </div>
      </>
    )
  }
}