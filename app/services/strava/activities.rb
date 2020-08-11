module Strava
  class Activities
    require "fast_polylines"

    def get_activity_streams (id)
      p "activity streams"
      t = HTTParty.get("https://www.strava.com/api/v3/activities/#{id}/streams", query: {"keys" => "time", "key_by_type" => true}, headers: headers).parsed_response
      c = HTTParty.get("https://www.strava.com/api/v3/activities/#{id}/streams", query: {"keys" => "latlng", "key_by_type" => true}, headers: headers).parsed_response
      p t
      timestamps = t["time"]["data"]
      coords = c["latlng"]["data"]
      p timestamps.count
      p coords.count
      results = [timestamps, coords]
    end

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
      p "token check"
      query_params = { 
        "client_id" => Rails.application.credentials.strava_client_id,
        "client_secret" => Rails.application.credentials.strava_client_secret,
        "grant_type" => "refresh_token",
        "refresh_token" => @user.strava_user_refresh_token
      }
      if @user.strava_user_token_expiration < Time.now.to_i + 300
        all_users = User.where(strava_uid: @user.strava_uid)
        p "token refresh"
        p query_params
        response = HTTParty.post("https://www.strava.com/oauth/token", query: query_params)
        p response.parsed_response
        all_users.to_a.each do |u|
          p "updating #{u.email}"
          u.strava_user_token = response.parsed_response["access_token"]
          u.strava_user_token_expiration = response.parsed_response["expires_at"]
          u.strava_user_refresh_token = response.parsed_response["refresh_token"]
          u.save
          u.strava_user_token 
        end
        @user = User.where(email: @user.email).first
      end
      p @user.strava_user_token
      return @user.strava_user_token
    end 

    def list_activities
      response.map {|a| a["name"]}
    end

    def refresh_activities
        @user.activities.destroy_all
        response.each do |activity|
          params = {
            name: activity["name"],
            aid: activity["id"],
            description: "nil",
            distance: (activity["distance"].to_f/1609).round(2),
            total_elevation_gain: activity["total_elevation_gain"],
            moving_time: activity["moving_time"],
            elapsed_time: activity["elapsed_time"],
            start_date: activity["start_date_local"],
            start_date_utc: activity["start_date"],
            start_lat: activity["start_latlng"][0],
            start_lng: activity["start_latlng"][1],
            end_lat: activity["end_latlng"][0],
            end_lng: activity["end_latlng"][1],
            workout_type: activity["type"],
            polymap: activity["map"]["polyline"],
            map_coords: FastPolylines.decode(activity["map"]["summary_polyline"]).map{ |pair|  
              lat = pair.shift 
              pair.push(lat)}, # switch order
            created_at: "nil",
            updated_at: "nil",
          }
          @user.activities.create(params)
        end
    end

    def check_auth
      response = HTTParty.get("https://www.strava.com/api/v3/athlete", headers: headers)
      p "auth check"
      p response.parsed_response
      c = response.code
      p c
      if (c != 200)
        p "false"
        return false
      end
    end

    def self.refresh_activities (user)
      u = new(user)
      # u.check_auth
      u.refresh_activities
    end

    def self.list_activities (user)
      u = new(user)
      # u.check_auth
      u.list_activities
    end

    def self.get_activity_streams (user, id)
      u = new(user)
      # u.check_auth
      u.get_activity_streams(id)
    end

    def self.check_auth (user)
      new(user).check_auth
    end

  end
end