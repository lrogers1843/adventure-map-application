module Strava
  class Activities
    require "fast_polylines"
    def initialize (user)
        @user = user
    end    
  
    def response
      page_num = 1
      page = ["default"]
      @response = []
      until page == []
        query_params = { 
          "page" => page_num,
          "per_page" => 200,
        }
        page = HTTParty.get("#{base_url}", query: query_params, headers: headers).parsed_response
        @response = @response + page
        page_num += 1 
      end
      @response
    end

    def base_url
      "https://www.strava.com/api/v3/athlete/activities"
    end

    def headers
      {"Authorization" => "Bearer #{user_access_token}"}
    end

    def user_access_token
      query_params = { 
        "client_id" => Rails.application.credentials.strava_client_id,
        "client_secret" => Rails.application.credentials.strava_client_secret,
        "grant_type" => "refresh_token",
        "refresh_token" => @user.strava_user_refresh_token
      }
      if @user.strava_user_token_expiration < Time.now.to_i + 300
        response = HTTParty.post("https://www.strava.com/oauth/token", query: query_params)
        @user.strava_user_token = response.parsed_response["access_token"]
        @user.strava_user_token_expiration = response.parsed_response["expires_at"]
        @user.strava_user_refresh_token = response.parsed_response["refresh_token"]
      end
      @user.strava_user_token
    end 

    def list_activities
      response.map {|a| a["name"]}
    end

    def refresh_activities
      @user.activities.destroy_all
      response.each do |activity|
        params = {
          name: activity["name"],
          description: "nil",
          distance: (activity["distance"].to_f/1609).round(2),
          total_elevation_gain: activity["total_elevation_gain"],
          moving_time: activity["moving_time"],
          elapsed_time: activity["elapsed_time"],
          start_date: activity["start_date_local"],
          start_lat: activity["start_latlng"][0],
          start_lng: activity["start_latlng"][1],
          end_lat: activity["end_latlng"][0],
          end_lng: activity["end_latlng"][1],
          workout_type: activity["type"],
          polymap: activity["map"]["summary_polyline"],
          map_coords: FastPolylines.decode(activity["map"]["summary_polyline"]).map{ |pair|  
            lat = pair.shift 
            pair.push(lat)}, # switch order
          created_at: "nil",
          updated_at: "nil",
        }
        @user.activities.create(params)
      end
    end

    def self.refresh_activities (user)
      new(user).refresh_activities
    end

    def self.list_activities (user)
      new(user).list_activities
    end

  end
end