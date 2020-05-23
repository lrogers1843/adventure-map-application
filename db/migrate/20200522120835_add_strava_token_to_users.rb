class AddStravaTokenToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :strava_user_token, :string
    add_column :users, :strava_user_refresh_token, :string
    add_column :users, :strava_user_token_expiration, :integer
  end
end
