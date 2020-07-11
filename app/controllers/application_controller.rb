class ApplicationController < ActionController::Base
    def after_sign_out_path_for(resource)
        root_path
    end

    def after_sign_in_path_for(resource)
        case current_user.authorization_state
          when :strava_authorized
            after_signup_path(:google)
          when :google_authorized # Note that this should be an impossible state since we're starting with Strava first
            after_signup_path(:strava)
          when :both_authorized
            map_path
          else
            after_signup_path(:strava)
          end
      end

    def welcome
    end
end
