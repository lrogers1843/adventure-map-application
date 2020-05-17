Rails.application.config.middleware.use OmniAuth::Builder do
    provider :strava, Rails.application.credentials.strava_client_id, Rails.application.credentials.strava_api_key, scope: 'public'
  end