class AddUserToActivties < ActiveRecord::Migration[6.0]
  def change
    add_reference :activities, :user
  end
end
