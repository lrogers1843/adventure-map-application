class AddCoordsToActivity < ActiveRecord::Migration[6.0]
  def change
    add_column :activities, :map_coords, :text, array: true, default: []
  end
end
