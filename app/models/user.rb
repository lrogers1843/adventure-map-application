class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  
  #multi
  include OmniauthAttributesConcern
    
  has_many :user_authentications
  has_many :activities, dependent: :destroy

  devise :omniauthable, :database_authenticatable, :registerable, :recoverable, :rememberable

  def self.create_from_omniauth(params)
      self.send(params.provider,params)
  end

  before_save :extract_omniauth_data #will this re-write strava access info when google token is refreshing, and vice-versa? may need to move it up to the callback controller

  def extract_omniauth_data
    p strava_data.present?
    if (strava_data.present?)
      # self.strava_user_token = strava_data["credentials"]["token"]
      # self.strava_user_refresh_token = strava_data["credentials"]["refresh_token"]
      # self.strava_user_token_expiration = strava_data["credentials"]["expires_at"]
    end
    if (google_oauth2_data.present?)
      p "google extract"
      # self.google_access_token = google_oauth2_data["credentials"]["token"]
      # self.google_refresh_token = google_oauth2_data["credentials"]["refresh_token"]
    end


  end

  #strava only
  # devise :database_authenticatable, :registerable,
  #        :recoverable, :rememberable
  # devise :omniauthable, omniauth_providers: %i[strava]

  # def self.from_omniauth(auth)
  #     where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
  #     user.first_name = auth.info.first_name  
  #     user.last_name = auth.info.last_name 
  #     user.password = Devise.friendly_token[0, 20]
  #     user.strava_user_token = auth.credentials.token 
  #     user.strava_user_refresh_token = auth.credentials.refresh_token 
  #     user.strava_user_token_expiration = auth.credentials.expires_at 
  #     # assuming the user model has an image 
  #     # user.image = auth.info.image 
  #     # If you are using confirmable and the provider(s) you use validate emails, 
  #     # uncomment the line below to skip the confirmation emails.
  #     # user.skip_confirmation!
  #   end
  # end

end
