Rails.application.routes.draw do
  devise_for :users, controllers: { omniauth_callbacks: 'users/omniauth_callbacks' }
  resources :users
  resources :activities
  get 'hello_world', to: 'hello_world#index'
end
