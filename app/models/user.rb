class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable
  devise :omniauthable, omniauth_providers: %i[strava]
  has_many :activities, dependent: :destroy

  def self.from_omniauth(auth)
      where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.first_name = auth.info.first_name  
      user.last_name = auth.info.last_name 
      user.password = Devise.friendly_token[0, 20]
      user.strava_user_token = auth.credentials.token 
      user.strava_user_refresh_token = auth.credentials.refresh_token 
      user.strava_user_token_expiration = auth.credentials.expires_at 
      # assuming the user model has an image 
      # user.image = auth.info.image 
      # If you are using confirmable and the provider(s) you use validate emails, 
      # uncomment the line below to skip the confirmation emails.
      # user.skip_confirmation!
    end
  end

end
