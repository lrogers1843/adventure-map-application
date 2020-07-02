class AddGoogleToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :google_access_token, :string
    add_column :users, :google_access_token_expiration, :time
    add_column :users, :google_refresh_token, :string
  end
end
