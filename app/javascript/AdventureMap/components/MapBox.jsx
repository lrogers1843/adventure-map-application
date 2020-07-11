import React from 'react';
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = 'pk.eyJ1IjoibHJvZ2VyczE4NDMiLCJhIjoiY2thZ3Fnejk2MGI3dzJwbWo0eXE1dHF6MyJ9.oYfkk7ZeGShmfugXoZ6Wkg';

export default class MapBox extends React.Component {
  newMap(){ 
    console.log("newmap")
  return (
    new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/' + this.props.map_style,
      center: [-80.5, 35],
      zoom: 9
    })
    )
  }

  zoomIn = (e) => {
    var coordinates = this.props.zoom_coords;
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

  addActivities() {
    console.log("addsrc")

    this.state.map.addSource('activities', this.props.geojson);
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

  changeStyle() {
    this.state.map.setStyle('mapbox://styles/' + this.props.map_style)
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(prevProps.map_style != this.props.map_style){
      changeStyle()
    }

    this.updateMap()
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

  

      map.on('click', 'activities', (e) => {this.onActivitySelected(e)})
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

  onActivitySelected(e) {
    console.log("activity click")
    //object cleanup for html display
    var props = e.features[0].properties;
    var endtime = new Date(props['Full_Date'])
    console.log(endtime)
    endtime.setSeconds( endtime.getSeconds() + props['Total_Elapsed_Time'] )

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

    var onActivitySelectedProps = {
      activity_datetime: new Date(props['Full_Date']),
      activity_endtime: endtime,
      photo_button: true,
      activity_props: props,
    }

    var popup = new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(props)
    .addTo(this.state.map)

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
    popup.on('close', (e) => {
      map.setFilter('activities', null)
      map.setFeatureState(
        { source: 'activities', id: selectedStateId },
        { selected: false }
      )
      this.onActivityDeselected(e)
    })

    this.props.onActivitySelected(e, onActivitySelectedProps)
  }

  onActivityDeselected(e) {
    this.props.onActivityDeselected(e)
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
    this.addActivities()
    this.displayActivities()
  }

  render() {
    return (
      <div ref={el => this.mapContainer = el} className='mapContainer'/>
    )
  }
}