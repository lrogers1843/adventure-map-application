# frozen_string_literal: true

class HelloWorldController < ApplicationController
  layout "hello_world"

  def index
    @hello_world_props = { name: "Stranger" }
    # coordinates = [[-78.298695,33.911518],[-78.269333,33.914164]]
    # matching = Mapbox::Matching.for_coordinates(coordinates)
    # activities = Strava::Activities.refresh_activities(current_user)
    
    

  end
end
