class Activity < ApplicationRecord
belongs_to :user

def to_geojson
    {
        'type': 'Feature',
        'id': id,
        'properties': {
            'Name': name,
            'Date': "#{start_date.month}/#{start_date.day}/#{start_date.year}",
            'Distance (miles)': distance,
            'Total Elevation Gain (ft)': (total_elevation_gain*3.281).round(),
            'Total Elapsed Time': Time.at(elapsed_time).utc.strftime("%khrs %Mmin"),
            'Total Moving Time': Time.at(moving_time).utc.strftime("%khrs %Mmin"),
            'Activity Type': workout_type,
            'id': id
        },
        'geometry': {
        'type': 'LineString',
        'coordinates': map_coords
        }
    }
end

end
