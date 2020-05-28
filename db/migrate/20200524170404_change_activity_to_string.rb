class ChangeActivityToString < ActiveRecord::Migration[6.0]
  def up
    change_column :activities, :workout_type, :string
  end

  def down
    change_column :activities, :workout_type, :integer
  end
end
