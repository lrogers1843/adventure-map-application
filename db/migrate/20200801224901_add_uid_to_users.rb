class AddUidToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :strava_uid, :bigint
  end
end
