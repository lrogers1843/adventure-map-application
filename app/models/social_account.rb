class SocialAccount < ApplicationRecord
belongs_to :user
belongs_to :authentication_provider

scope :get_provider_name, -> (provider_name) {where("name = ?",provider_name)}

end
