# Adventure map application
# Devlopment Log
### Rails App
cloned remote
suspenders .
had to add pg confic to config/database.yml
redid db:create and db:migrate
### Node Setup
node - https://gist.github.com/noygal/6b7b1796a92d70e24e35f94b53722219#installing-nodejs
nvm - had to ref .bashrc from .profile to init
yarn - https://medium.com/@harshityadav95/setting-up-nodejs-yarn-on-wsl-windows-subsystem-for-linux-e29d952ff6eb
### Webpacker
You will need to add Webpacker to your application. Run the following in your project directory:
bundle exec rails webpacker:install
bundle exec rails webpacker:install:react
yarn add --dev webpack-dev-server
### Foreman
I have a preference for utilizing Docker to manage development dependencies, but, because React on Rails utilizes Foreman for so many of its instructions, I'm including it in this tutorial as many things will be MUCH easier to do if you have it installed.
Run the following command in your project directory:
bundle add foreman --group "development"
use:  
In order to run both parts of the webpack dev server, you will want to run the following commands in your project directory:
foreman start -f Procfile.dev
foreman start -f Procfile.dev-server
### React-on-rails
gem 'react_on_rails', '11.3.0'
bundle
git commit -am "Add React on Rails gem"
rails generate react_on_rails:install
bundle && yarn
### Heroku 
heroku create adventure-map-viewer
heroku buildpacks:set heroku/ruby
heroku buildpacks:add --index 1 heroku/nodejs
### Hello World
with foreman dev-server and pg running (w/o webpacker), http://localhost:3000/hello_world works
app/views/hello_world/index.html.erb set prerender: true
### Models
Adding User and Activity
User has many Activities, tweaking model and activity schema, plus activity controller to assign last user for testing purpose 
### Devise and OmniAuth
Used devise gempage for setup, added auth to User
In activities controller, adding auth requirement and current user as new activity owner
adding gem "omniauth-strava", skipped config/initializers/omniauth.rb and contents
db add the columns "provider" (string) and "uid" (string) to your User model.
config/initializers/devise.rb add config.omniauth
added env vars to fix
{"message":"Bad Request","errors":[{"resource":"Application","field":"client_id","code":"invalid"}]}
tweaked scope to fix
{"message":"Bad Request","errors":[{"resource":"Authorize","field":"scope","code":"invalid"}]}
had to set strava method in app/controllers/users/omniauth_callbacks_controller.rb
and self.from_omniauth in app/models/user.rb
Also removed :validatable from user model devise list, and now allows me so save user without email (Strava doesn't provide) 
### Mapbox
added mapbox_api_key to credentials
put api call in app/controllers/hello_world_controller.rb, api in new folder app/services
### Strava
api in app/services
need user token, expiration, etc, added that to user db table
### MapboxGL
yarn add mapbox
to make mapbox work, had to do add environment.loaders.delete('nodeModules'); in config/webpack/environment.js
then, manually import in app/javascript/bundles/HelloWorld/components/HelloWorld.jsx
this is because mapbox doesn;t play nice with webpack. The alternative approach is to use a "shim", which is the same thing needed for jquery, and put the library call further up in the /packs
### flatpickr
yarn add lib, call in app/javascript/bundles/HelloWorld/components/HelloWorld.jsx, use there for UI
monthly plugin seems broken, just going with range plugin instead
also learned that inspect breaks some flatpickr features
skipped range plugin due to small buggyness on display, went with two inputs
### filtering and updating 
achieved, just a small snag until saved map on state to provide reference for update functions
### rails call for filter
new call from component using JS fetch()
new route @ activities/filter
new controller method activities#filter to handle params and return JSON





### To-do
figure out why strava is pulling n-1 activities
css framework


## Getting Started

After you have cloned this repo, run this setup script to set up your machine
with the necessary dependencies to run and test this app:

    % ./bin/setup

It assumes you have a machine equipped with Ruby, Postgres, etc. If not, set up
your machine with [this script].

[this script]: https://github.com/thoughtbot/laptop

After setting up, you can run the application using [Heroku Local]:

    % heroku local

[Heroku Local]: https://devcenter.heroku.com/articles/heroku-local

## Guidelines

Use the following guides for getting things done, programming well, and
programming in style.

* [Protocol](http://github.com/thoughtbot/guides/blob/master/protocol)
* [Best Practices](http://github.com/thoughtbot/guides/blob/master/best-practices)
* [Style](http://github.com/thoughtbot/guides/blob/master/style)

## Deploying

If you have previously run the `./bin/setup` script,
you can deploy to staging and production with:

    % ./bin/deploy staging
    % ./bin/deploy production
