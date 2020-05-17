Rails.application.routes.draw do
  resources :users
  resources :activities
  get 'hello_world', to: 'hello_world#index'
end
