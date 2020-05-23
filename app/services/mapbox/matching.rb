module Mapbox
  class Matching

    def initialize (coordinates)
      @coordinates = coordinates
    end    

    def response
      HTTParty.get("#{base_url}#{coordinates_to_string}?access_token=#{Rails.application.credentials.mapbox_api_key}")
    end

    def coordinates_to_string
      @coordinates.map do |coordinate_set|
        coordinate_set.map(&:to_s).join(",")
      end.join(";")
    end

    def base_url
      "https://api.mapbox.com/matching/v5/mapbox/driving/"
    end

    def self.for_coordinates (coordinates)
      new(coordinates).response
    end

  end
end