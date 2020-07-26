class Activity < ApplicationRecord
belongs_to :user

def to_geojson
    {
        'type': 'Feature',
        'id': id,
        'properties': {
            'Name': name,
            'Date': "#{start_date.month}/#{start_date.day}/#{start_date.year}",
            'Full_Date': Time.at(start_date_utc),
            'Distance (miles)': distance,
            'Total Elevation Gain (ft)': (total_elevation_gain*3.281).round(),
            'Start Time': start_date.utc.strftime("%H:%M"),
            'Total Elapsed Time': Time.at(elapsed_time).utc.strftime("%khrs:%Mmin"),
            'Total_Elapsed_Time': elapsed_time,
            'Total Moving Time': Time.at(moving_time).utc.strftime("%khrs %Mmin"),
            'Activity Type': workout_type,
            'id': id,
            'aid': aid,
            'coords': map_coords
        },
        'geometry': {
        'type': 'LineString',
        'coordinates': map_coords
        }
    }
end
def to_flag
    {
        'type': 'Feature',
        'id': id,
        'properties': {
            'Coordinates': map_coords[0],
        },
        'geometry': {
        'type': 'Point',
        'coordinates': map_coords[0]
        }
    }
end

end
