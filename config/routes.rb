Rails.application.routes.draw do
  devise_for :users, controllers: { omniauth_callbacks: 'users/omniauth_callbacks' }
  resources :users
  resources :activities
  resources :after_signup
  post 'users/refresh_google_token', to: 'users#refresh_google_token'
  get 'map', to: 'map#index'
  post 'activities/filter', to: 'activities#filter'
  root 'application#welcome'
end
