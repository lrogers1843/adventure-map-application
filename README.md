# Adventure map application
## Devlopment Log

### App Run Cheatsheet
postgres startup: alias 'pg'
then either, 
1) Webpacker/Rails: 'foreman start -f Procfile.dev-server'
or 
2) 
manual run proceedure, two commands in seperate consoles
webpacker: rm -rf public/packs/* || true && bundle exec rake react_on_rails:locale && bin/webpack-dev-server --inline=false
webserver: rails s -p 3000
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
In activities controller, adding auth requirement and current user as new activity owner.
adding gem "omniauth-strava", skipped config/initializers/omniauth.rb and contents
db add the columns "provider" (string) and "uid" (string) to your User model.
config/initializers/devise.rb add config.omniauth
added env vars to fix
{"message":"Bad Request","errors":[{"resource":"Application","field":"client_id","code":"invalid"}]}
tweaked scope to fix
{"message":"Bad Request","errors":[{"resource":"Authorize","field":"scope","code":"invalid"}]}
had to set strava method in app/controllers/users/omniauth_callbacks_controller.rb
and self.from_omniauth in app/models/user.rb
Also removed :validatable from user model devise list, and now allows me to save user without email (Strava doesn't provide) 
### Mapbox
added mapbox_api_key to credentials
put api call in app/controllers/hello_world_controller.rb, api in new folder app/services
### Strava
app registered on strava devs dashboard
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
### Ruby Polyline decode
storing coordinates in new array column (map_coords:) in app/services/strava/activities.rb:  
switching lat/long order there
### Heroku Deploy
had to set the following in hero webpage manually before deploy
ASSET_HOST: siteURL.herokuapp.com
APPLICATION_HOST: siteURL.herokuapp.com
AUTO_MIGRATE_DB: true
had to run db: prepare
then had to move flatpickr css link into app/views/layouts/hello_world.html.erb
### Redeploy
git push heroku master
heroku run rails db:prepare
clean out old users
if not present, AuthenticationProvider.create(name: "google_oauth2") and strava

### css rewrite
created app/javascript/stylesheets/components/map.scss
for include in app/javascript/stylesheets/application.scss, then include that in app/javascript/packs/application.js
then put layout "application" in hello world controller
in application layout had to use   <%= stylesheet_pack_tag :application, media: "all" %>
  <%= render "javascript" %> links to the app/javascript/packs/application.js
  also had to require("mapbox-gl/dist/mapbox-gl.css")
### rails navbar
could not reposition map without using absolute positioning, didn't want to absolute position everything, decided to just render the logout with rails on top of the navbar js
### multiauth
https://github.com/virtualforce/Devise-Omniauth-Multiple-Providers
created models
-authentication_provider.rb
-social_accounts
-user_authentications 
callbacks now handled in app/controllers/concerns/omni_concern.rb, modified from the tutorial to save the omniauth data on the user and assume the user is logged in. now no need for app/models/concerns/omniauth_attributes_concern.rb
### Google Oauth
gem google oauth2
setup new Google Cloud Platform project called adventure-map, enabled photos API, got keys and registered app there
### TailwindCSS
 yarn install
 import components in app/javascript/stylesheets/application.scss
 require in postcss.config.js
 scrollbar style https://css-tricks.com/snippets/sass/custom-scrollbars-mixin/
### Refactor
created several new react elements for image display and UI, which just requires jsx file creating and reference in top of the file where the component is called. 
### OAuth checks
app/controllers/map_controller.rb line28
app/javascript/AdventureMap/components/AdventureMap.jsx line146
app/javascript/AdventureMap/components/AdventureMap.jsx line197
app/javascript/AdventureMap/components/AdventureMap.jsx line222
app/controllers/activities_controller.rb line 75

### single social account with multi users
any refresh token save need to apply to both accounts that are authorized, otherwise the next one will be offering the wrong (expired) refresh anytime the other has expired and already updated. 
OmniAuth and multi-users sharing a strava account: the best user experience would be a join table where it finds that for users that match and they share
social accounts is a good table, but would join to instead of belong to user, then a third table that is the join table like this
so strava stuff that is saved on user (and google) should be in the social accounts table where multiple users can find and edit
major code cleanup would be the omni concerns file, tables, models, anywhere that they are saved/updated
look out for: make sure a user only has one of these accounts (can be multi-social, but don't allow strava duplicates)


### bugfix
if sign up as existing user, PG::UniqueViolation: ERROR: duplicate key
handled error after save with code in config/locales/devise.en.yml and had to add line 48 of config/locales/devise.en.yml



### To-do
figure out why strava is pulling n-1 activities
if user has no activities, TypeError (no implicit conversion of nil into String):
2020-07-22T01:20:55.372542+00:00 app[web.1]: [0c264fc4-414b-45b3-8c87-c3a723151fe4] app/controllers/activities_controller.rb:26:in `filter'
activity clicky is tricky
navbar bleeds on smaller resolution.


