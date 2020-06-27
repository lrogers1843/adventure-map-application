Rails.application.routes.draw do
  devise_for :users, controllers: { omniauth_callbacks: 'users/omniauth_callbacks' }
  resources :users
  resources :activities
  get 'map', to: 'map#index'
  post 'activities/filter', to: 'activities#filter'
  root 'application#welcome'
end
