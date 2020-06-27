class AddStravaDetailsToUser < ActiveRecord::Migration[6.0]
  def change
      add_column :users, :response, :json, null: false, default: '{}'
      add_column :users, :strava_uid, :string
  end
end
