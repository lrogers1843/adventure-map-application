# frozen_string_literal: true

class MapController < ApplicationController
  before_action :authenticate_user!
  skip_before_action :authenticate_user!, only: [:index]
  layout "application"

  # advice: just send everything thourgh the index, send to demo user if no current_user

  def effective_user
    current_user || demo_user
  end

  # def demo
  #   current_user = User.where(email: "luke@gmail.com").first
  #   p current_user 
  #   start_date = current_user.activities.minimum("start_date")
  #   @map_props = { start_date: start_date }
  #   render "index"
  # end

  def index
    p params
    p effective_user 
    p effective_user.activity_expiration
    now = Time.zone.now
    p now
    if (current_user && now > current_user.activity_expiration)
      Strava::Activities.refresh_activities(current_user)
      current_user.activity_expiration = now + 7200 
      current_user.save
    end
    start_date = effective_user.activities.minimum("start_date")
    @map_props = { start_date: start_date }


    # p current_user
    # map_style = "mapbox/outdoors-v11"
    # end_date = current_user.activities.maximum("start_date")
    # activities = current_user.activities.all
    # # unique types
    # unique_types = [] 
    # activities.each do |a|
    #   unique_types.push(a.workout_type)
    # end
    # unique_types.uniq!
    # # dropdown components
    # unique_types.map! { |type|
    # {value: type, display: type}
    # }
    # # add empty dropdown
    # unique_types.prepend({value: "", display: "all"})
    # # geojson
    # geojson = {
    #   'type': 'geojson',
    #   'data': {
    #   'type': 'FeatureCollection',
    #   'features': activities.map{|a| a.to_geojson }
    #   }
    # }
    # #zoom
    # zoom_coords = []
    # activities.each do |a|
    #   z = a.map_coords.map{ |pair| pair.map{ |coord| coord.to_f }}
    #   zoom_coords = zoom_coords + z
    # end
    # @hello_world_props = { start_date: start_date, end_date: end_date, activities: activities, geojson: geojson, types: unique_types, zoom_coords: zoom_coords, map_style: map_style }
  end
end
