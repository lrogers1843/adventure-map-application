class ActivitiesController < ApplicationController
  before_action :set_activity, only: [:show, :edit, :update, :destroy]
  before_action :authenticate_user!
  skip_before_action :verify_authenticity_token, :only => [:filter]

  def filter

    # get initial set by date
    activities = Activity.where(start_date: params[:startdate]..params[:enddate])

    # filer by type
    if (params[:activity_type])
      activities = activities.where(workout_type: params[:activity_type])
    end
    
    # return to app
    render json: activities
    
  end

  # GET /activities
  def index
    @activities = Activity.all
  end

  # GET /activities/1
  def show
  end

  # GET /activities/new
  def new
    @activity = Activity.new
  end

  # GET /activities/1/edit
  def edit
  end

  # POST /activities
  def create
    @activity = current_user.activities.create(activity_params)

    if @activity.save
      redirect_to @activity, notice: 'Activity was successfully created.'
    else
      render :new
    end
  end

  # PATCH/PUT /activities/1
  def update
    if @activity.update(activity_params)
      redirect_to @activity, notice: 'Activity was successfully updated.'
    else
      render :edit
    end
  end

  # DELETE /activities/1
  def destroy
    @activity.destroy
    redirect_to activities_url, notice: 'Activity was successfully destroyed.'
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_activity
      @activity = Activity.find(params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def activity_params
      params.require(:activity).permit(:name, :description, :distance, :total_elevation_gain, :moving_time, :elapsed_time, :start_date, :start_lat, :start_lng, :end_lat, :end_lng, :workout_type, :polymap)
    end
end
