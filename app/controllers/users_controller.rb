class UsersController < ApplicationController
  skip_before_action :verify_authenticity_token, only: :refresh_google_token
  before_action :set_user, only: [:show, :edit, :update, :destroy]

  def refresh_google_token
    user = current_user
    p user
    
    if (user.google_access_token_expiration.nil? || user.google_access_token_expiration < Time.now + 300) 
      p "refresh api call"
      query_params = { 
        "client_id" => Rails.application.credentials.google_client_id,
        "client_secret" => Rails.application.credentials.google_client_secret,
        "grant_type" => "refresh_token",
        "refresh_token" => user.google_refresh_token
      }

      response = HTTParty.post("https://oauth2.googleapis.com/token", query: query_params)
      p response.parsed_response
      user.google_access_token = response.parsed_response["token"]
      user.google_access_token_expiration = Time.now - response.parsed_response["expires_in"]
      user.google_refresh_token = response.parsed_response["refresh_token"]

    end

    token = user.google_access_token
    p token
    render json: token
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
