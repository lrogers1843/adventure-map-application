class CreateActivities < ActiveRecord::Migration[6.0]
  def change
    create_table :activities do |t|
      t.string :name
      t.string :description
      t.float :distance
      t.float :total_elevation_gain
      t.integer :moving_time
      t.integer :elapsed_time
      t.datetime :start_date
      t.float :start_lat
      t.float :start_lng
      t.float :end_lat
      t.float :end_lng
      t.integer :workout_type
      t.string :polymap

      t.timestamps
    end
  end
end
