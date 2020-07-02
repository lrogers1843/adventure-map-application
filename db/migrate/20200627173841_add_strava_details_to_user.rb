class AddStravaDetailsToUser < ActiveRecord::Migration[6.0]
  def change
      add_column :users, :strava_data, :jsonb
      add_column :users, :google_oauth2_data, :jsonb
  end
end
