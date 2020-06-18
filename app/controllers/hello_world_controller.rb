# frozen_string_literal: true

class HelloWorldController < ApplicationController
  before_action :authenticate_user!
  layout "hello_world"

  def index
    # Strava::Activities.refresh_activities(current_user)
    map_style = "mapbox/outdoors-v11"
    start_date = current_user.activities.minimum("start_date")
    end_date = current_user.activities.maximum("start_date")
    activities = current_user.activities.all

    # unique types
    unique_types = [] 
    activities.each do |a|
      unique_types.push(a.workout_type)
    end
    unique_types.uniq!
    # dropdown components
    unique_types.map! { |type|
    {value: type, display: type}
    }
    # add empty dropdown
    unique_types.prepend({value: "", display: "all"})

    # geojson
    geojson = {
      'type': 'geojson',
      'data': {
      'type': 'FeatureCollection',
      'features': activities.map{|a| a.to_geojson }
      }
    }

    #zoom
    zoom_coords = []
    activities.each do |a|
      z = a.map_coords.map{ |pair| pair.map{ |coord| coord.to_f }}
      zoom_coords = zoom_coords + z
    end
    p "rails says"
    p zoom_coords

    @hello_world_props = { start_date: start_date, end_date: end_date, activities: activities, geojson: geojson, types: unique_types, zoom_coords: zoom_coords, map_style: map_style }
  end
end
