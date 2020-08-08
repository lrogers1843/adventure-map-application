class UsersController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:refresh_google_token, :google_reauth, :strava_reauth]
  before_action :set_user, only: [:show, :edit, :update, :destroy]


  def effective_user
    current_user || demo_user
  end

  def refresh_google_token
    user = effective_user

    if (user.google_access_token_expiration.nil? || user.google_access_token_expiration < Time.now + 300) 
      p "refresh api call"
      query_params = { 
        "client_id" => Rails.application.credentials.google_client_id,
        "client_secret" => Rails.application.credentials.google_client_secret,
        "refresh_token" => user.google_refresh_token,
        "grant_type" => "refresh_token"
      }
      response = HTTParty.post("https://oauth2.googleapis.com/token", query: query_params)

      now = Time.now
      exp = response.parsed_response["expires_in"]
      e = now - exp.seconds

      all_users = User.where(strava_uid: @user.strava_uid) || user
      all_users.to_a.each do |u|
        p "googley"
        u.google_access_token_expiration = e
        u.google_access_token = response.parsed_response["access_token"]
        u.save  
      end

      token = [user.google_access_token]
      render json: token
    else 
      p "no refresh"
      token = [user.google_access_token]
      render json: token
    end
    
  end

  #reauth
  def google_reauth
    render json: {message: "There is an issue with your google authentication, please authenticate again", redirect_url: after_signup_path(:google)}
  end

  def strava_reauth
    render json: {message: "There is an issue with your Strava authentication, please authenticate again", redirect_url: after_signup_path(:strava)}
  end


  # GET /users
  def index
    @users = User.all
  end

  # GET /users/1
  def show
  end

  # GET /users/new
  def new
    @user = User.new
  end

  # GET /users/1/edit
  def edit
  end

  # POST /users
  def create
    @user = User.new(user_params)
    p "creating user"
    if @user.save
      redirect_to @user, notice: 'User was successfully created.'
    else
      render :new
    end
  end

  # PATCH/PUT /users/1
  def update
    if @user.update(user_params)
      redirect_to @user, notice: 'User was successfully updated.'
    else
      render :edit
    end
  end

  # DELETE /users/1
  def destroy
    @user.destroy
    redirect_to users_url, notice: 'User was successfully destroyed.'
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_user
      p params
      @user = User.find(params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def user_params
      params.require(:user).permit(:first_name, :last_name)
    end
end
