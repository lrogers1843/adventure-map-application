class StoreUserState < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :google_authorized, :boolean, null: false, default: false
    add_column :users, :strava_authorized, :boolean, null: false, default: false
  end
end
