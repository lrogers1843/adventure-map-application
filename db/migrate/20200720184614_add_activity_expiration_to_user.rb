class AddActivityExpirationToUser < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :activity_expiration, :datetime, default: Time.zone.now
  end
end
