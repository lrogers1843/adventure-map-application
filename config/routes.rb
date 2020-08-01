Rails.application.routes.draw do
  devise_for :users, controllers: { 
    confirmations: 'users/confirmations',
    omniauth_callbacks: 'users/omniauth_callbacks',
    confirmations: 'users/confirmations',
    passwords: 'users/passwords',
    registrations: 'users/registrations',
    sessions: 'users/sessions',
    unlocks: 'users/unlocks',
  }
  resources :users
  resources :activities
  resources :after_signup
  post 'users/refresh_google_token', to: 'users#refresh_google_token'
  post 'users/google_reauth', to: 'users#google_reauth'
  post 'users/strava_reauth', to: 'users#strava_reauth'
  get 'map', to: 'map#index'
  post 'activities/filter', to: 'activities#filter'
  post 'activities/detailed_activity', to: 'activities#detailed_activity'
  root 'application#welcome'
end
