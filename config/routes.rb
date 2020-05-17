Rails.application.routes.draw do
  devise_for :users
  resources :users
  resources :activities
  get 'hello_world', to: 'hello_world#index'
end
