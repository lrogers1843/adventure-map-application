class AddIdToActivities < ActiveRecord::Migration[6.0]
  def change
    add_column :activities, :aid, :bigint
  end
end
