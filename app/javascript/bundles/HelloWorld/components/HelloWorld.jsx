import PropTypes from 'prop-types';
import React from 'react';
import mapboxgl from 'mapbox-gl';
import polyline from '@mapbox/polyline';
import Flatpickr from "react-flatpickr";
import 'flatpickr/dist/themes/dark.css';
mapboxgl.accessToken = 'pk.eyJ1IjoibHJvZ2VyczE4NDMiLCJhIjoiY2thZ3Fnejk2MGI3dzJwbWo0eXE1dHF6MyJ9.oYfkk7ZeGShmfugXoZ6Wkg';

function PhotoButton(props) {
  if (props.toShow) {
    return <div>
      <p>Display Photos From Activity</p>
      <button 
      className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-2/3"
      onClick={
        props.onClick
      }>Photos
      </button>
      </div>;
  }
  return null;
}

function PhotoScroller(props) {
  if (props.toShow) {
    return <div 
    className="photo_scroller">
    <button onClick={props.remove} className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-2/3">remove</button>
    <div>{props.activity_props}</div>
    {props.toShow.map( (l) => <img src={l}/>)}
    hello
    </div>
  }
  return null;
}


export default class HelloWorld extends React.Component {
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
      }, this.updateMap);
      console.log("fetch end")
      console.log(json);
    });
  }

  // activityFilterAndParseForMap() {
  //   var count = this.props.activities.length;
  //   var activities = this.props.activities;
  //   var zooms = [];
  //   var selected_activities = [];
  //   var start_date = this.state.start_date
  //   var end_date = this.state.end_date
  //   for (var i = 0; i < count-1; i++) {
  //     var activity_date = new Date(activities[i].start_date)
  //     if (activity_date >= start_date && activity_date <= end_date) {
  //       var activity_coordinates = polyline.toGeoJSON(activities[i].polymap).coordinates; //gets activity coords
  //       zooms = zooms.concat(activity_coordinates); //appends for zooms
  //       selected_activities.push(activity_coordinates); //appends for display
  //     };
  //   };
  //   this.setState({zoom_coords: zooms, selected_activities: selected_activities});
  // }

  newMap(){ 
    console.log("newmap")
  return (
    new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/' + this.state.map_style,
      center: [-80.5, 35],
      zoom: 9
    })
    )
  }
  
  zoomIn = (e) => {
    console.log("zoom")
    e.preventDefault()
    var coordinates = this.state.zoom_coords;
    var bounds = coordinates.reduce(function(bounds, coord) {
      return bounds.extend(coord);
    }, 
    new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    console.log("new")
    this.state.map.fitBounds(bounds, {
    padding: 50
    });
    console.log("zoom done")
  }

  addActivities(map, datasrc) {
    console.log("addsrc")

    map.addSource('activities', datasrc);
  }

  displayActivities(map) {
    console.log("display")

    map.addLayer({
      'id': 'activities-light',
      'type': 'line',
      'source': 'activities',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': 'grey',
        'line-opacity': 1,
        'line-width': 2,
      }
    });
    map.addLayer({
      'id': 'activities',
      'type': 'line',
      'source': 'activities',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': 'red',
        'line-opacity': 1,
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          4,
          2
          ]
      }
    });
  }

  updateStartdate = (start_date) => {
    this.setState({ start_date }, this.getActivities );
  };
  
  updateEnddate = (end_date) => {
    this.setState({ end_date }, this.getActivities );
  };

  updateStyle = (e) => {
    this.setState({ map_style: e.target.value }, this.changeStyle );
  };

  changeStyle() {
    this.state.map.setStyle('mapbox://styles/' + this.state.map_style)
  }

  componentDidMount() {
    console.log("did mount")
    //creates map and stores a reference in state
    const map = this.newMap()
    var hoveredStateId = null;
    this.setState({ map }, () => {
      console.log("adding event listeners")
      //load data after style
      map.on('style.load', () => {this.updateMap()})
      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'activities', () => {this.mouseLeave()})
      //chenge mouse from pointer on enter activity
      map.on('mouseenter', 'activities', () => {this.mouseEnter()})
      //popup

  

      map.on('click', 'activities', (e) => {this.displaySelected(e)})
      //test

    })      

    map.on('mousemove', 'activities', function(e) {
      // if (e.features.length > 0) {
        // map.setPaintProperty('activities', 'line-opacity', ['match', ['to-number', ['get', 'id']], e.features[0].id, 1 , 0.25])
        // map.setFilter('activities', ['==', ['get', 'id'], e.features[0].id])        // console.log(e.features[0].id)

        // if (hoveredStateId) {
        //   map.setFeatureState(
        //     { source: 'activities', id: hoveredStateId },
        //     { hover: false }
        //   );
        // }
        // hoveredStateId = e.features[0].id;
        // console.log(hoveredStateId)
        // map.setFeatureState(
        //   { source: 'activities', id: hoveredStateId },
        //   { hover: true }
        // );
      // }
    });
    map.on('mouseleave', 'activities', function() {
      // map.setFilter('activities', null)
      // if (hoveredStateId) {
      // map.setFeatureState(
      // { source: 'activities', id: hoveredStateId },
      // { hover: false }
      // );
      // }
      // hoveredStateId = null;
    });

  }

  displaySelected(e) {
    console.log("activity click")
    var map = this.state.map
    //object cleanup for html display
    var props = e.features[0].properties;
    var endtime = new Date(props['Full_Date']) 
    console.log(endtime)
    endtime.setSeconds( endtime.getSeconds() + props['Total_Elapsed_Time'] )
    this.setState( {
      activity_datetime: new Date(props['Full_Date']),
      activity_endtime: endtime,
      photo_button: true,
    }, console.log(this.state) )

    delete props.id
    delete props['Total_Elapsed_Time']
    delete props['Full_Date']

    props = JSON.stringify(props)



    props = props.replace(/"/g, '')
    props = props.replace(/{/g, '')
    props = props.replace(/}/g, '')
    props = props.replace(/,/g, ' ')
    props = props.replace(/:/g, ': ')
    props = props.replace(' colon ', ':')

    // add to sidebar
    this.setState({activity_props: props}, this.photosCall())

    // popup creation and highlight
    var popup = new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(props)
    .addTo(map)


    //highlight selected
    var selectedStateId = e.features[0].id
    map.setFeatureState(
      { source: 'activities', id: selectedStateId },
      { selected: true }
    );
    map.setFilter('activities', ['==', ['get', 'id'], e.features[0].id])

    // map.on('click', () => {
    //   console.log("map click")
    //   console.log(this.state.photo_button)
    //   if (this.state.photo_button == true) {
    //     map.setFilter('activities', null)
    //     map.setFeatureState(
    //       { source: 'activities', id: selectedStateId },
    //       { selected: false }
    //     )
    //     this.setState({photo_button: false})
    //   }
    // })


    //remove highlight
    popup.on('close', () => {
      map.setFilter('activities', null)
      map.setFeatureState(
        { source: 'activities', id: selectedStateId },
        { selected: false }
      )
      this.setState({photo_button: false, photos_links: null})
    })
  }

  mouseEnter() {
    this.state.map.getCanvas().style.cursor = 'pointer';
  }

  mouseLeave() {
    this.state.map.getCanvas().style.cursor = '';
  }

  updateMap() {
    console.log("starting updatemap")
    var map = this.state.map

    //remove old activities
    if (map.getLayer('activities')) {
    map.removeLayer('activities');
    map.removeLayer('activities-light');
    map.removeSource('activities');
    }
    
    //update display
    this.addActivities(map, this.state.geojson)
    this.displayActivities(map)
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
    console.log(this)
    var date = new Date(this.state.activity_datetime)

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
    this.pushLinksToState(filtered_photos)

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

  pushLinksToState(photos) {
    var links = photos.map( (p) => p.baseUrl + "=w150-h400" )
    this.setState({photos_links: links})
  }

  removeScroller(e) {
    e.preventDefault()
    this.setState({photos_links: null})
  }

  render() {
    return (
      <>
      <div>
        <div 
          ref={el => this.mapContainer = el} 
          className='mapContainer'
        />

        <div ref={el => this.navbar = el} className="navbar flex flex-col font-semibold">
        <div>
          <form className="flex flex-col items-left">
            Start Date
            <Flatpickr
            className="w-2/3"
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
            className="w-2/3"
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
              className="w-2/3"
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
            <PhotoButton toShow={this.state.photo_button} onClick={this.photosCall.bind(this)}/>
            {/* <p>Display Photos From Activity</p>
            <button 
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-1/2"
            onClick={this.getPhotos}
            >Photos
            </button> */}

            <br></br>

            <p>Zoom to Displayed Activities</p>
            <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-2/3" onClick={this.zoomIn}>Zoom</button>
          </form>
        </div>
      </div>
      <PhotoScroller 
      toShow={this.state.photos_links} 
      remove={this.removeScroller.bind(this)}
      activity_props={this.state.activity_props} 
      />
      </div>
      </>
    )
  }
}
