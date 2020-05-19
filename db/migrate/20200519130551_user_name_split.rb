class UserNameSplit < ActiveRecord::Migration[6.0]
  def change
    change_table(:users) do |t|
      t.column :last_name, :string
      t.rename :name, :first_name
    end
  end
end
