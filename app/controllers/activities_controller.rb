class ActivitiesController < ApplicationController
  before_action :set_activity, only: [:show, :edit, :update, :destroy]
  before_action :authenticate_user!
  skip_before_action :verify_authenticity_token, only: :filter
  def filter
    p params

    # type conversion to sync with active record
    params_start = Time.zone.parse(params[:start_date])
    params_end = Time.zone.parse(params[:end_date])

    # get initial set by date
    activities = current_user.activities.where(start_date: params_start..params_end)
    p activities.count

    # unique types
    unique_types = [] 
    activities.each do |a|
      unique_types.push(a.workout_type)
    end
    unique_types.uniq!

    # dropdown components
    unique_types.map! { |type|
    {value: type, display: type}
    }
    # add empty dropdown
    unique_types.prepend({value: "", display: "all"})
    

    # filer by type
    if (params[:activity_type] != "")
      activities = activities.where(workout_type: params[:activity_type])
    end
    p activities.count

    activities = Activity.last(3)
    features = []
    activities.each do |a|
      feature = {
        'type': 'Feature',
        'properties': {
        'name': a.name
        },
        'geometry': {
        'type': 'LineString',
        'coordinates': a.map_coords
        }
      }
    features.push(feature)
    end
    geojson = {
      'type': 'geojson',
      'data': {
      'type': 'FeatureCollection',
      'features': features
      }
    }

    #zoom
    zoom_coords = []
    activities.each do |a|
      zoom_coords = zoom_coords + a.map_coords
    end

    response = [geojson, activities, unique_types, zoom_coords]
    
    # return to app
    render json: response
    
  end

  def index
    @activites = current_user.activites.all
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
