module Strava
  class ListActivities

    def initialize (user)
        @user = user
    end    
  
    def response
      HTTParty.get("#{base_url}", headers: headers)
    end

    def base_url
      "https://www.strava.com/api/v3/athlete/activities"
    end

    def headers
      {"Authorization" => "Bearer #{user_access_token}"}
    end

    def user_access_token
      @user.strava_user_token
    end 

    def self.for_user (user)
      new(user).response
    end

  end
end