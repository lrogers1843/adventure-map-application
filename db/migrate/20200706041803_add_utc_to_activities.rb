class AddUtcToActivities < ActiveRecord::Migration[6.0]
  def change
    add_column :activities, :start_date_utc, :datetime
  end
end
