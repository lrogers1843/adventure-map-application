module OmniConcern
    extend ActiveSupport::Concern
      def create
        auth_params = request.env["omniauth.auth"]
        provider = AuthenticationProvider.get_provider_name(auth_params.try(:provider)).first
        authentication = provider.user_authentications.where(uid: auth_params.uid).first
        existing_user = current_user
        # need to find the demo user by strava_uid match, then update them below if they match. first, need to wipe db and record a uid in column for demo user
        if existing_user.strava_uid = "27718141"
          demo_user = User.where(email: "luke@gmail.com").first
          p "hi luke"
        end
        p provider.name
        p auth_params
        # existing_user.send(:"#{provider.name}_data=", auth_params)
        if (provider.name == "google_oauth2")
          existing_user.google_oauth2_data = auth_params
          existing_user.google_access_token = auth_params["credentials"]["token"]
          existing_user.google_access_token_expiration = Time.at(auth_params["credentials"]["expires_at"])
          existing_user.google_refresh_token = auth_params["credentials"]["refresh_token"]
          existing_user.google_authorized = true
          if demo_user
            demo_user.google_oauth2_data = auth_params
            demo_user.google_access_token = auth_params["credentials"]["token"]
            demo_user.google_access_token_expiration = Time.at(auth_params["credentials"]["expires_at"])
            demo_user.google_refresh_token = auth_params["credentials"]["refresh_token"]
            demo_user.google_authorized = true
            demo_user.save
            p "demo save"
          end
        end
        if (provider.name == "strava")
          existing_user.strava_data = auth_params
          existing_user.strava_user_token = auth_params["credentials"]["token"]
          existing_user.strava_user_token_expiration = Time.at(auth_params["credentials"]["expires_at"])
          existing_user.strava_user_refresh_token = auth_params["credentials"]["refresh_token"]
          existing_user.strava_authorized = true
          existing_user.strava_uid = auth_params["uid"]
          if demo_user
            demo_user.strava_data = auth_params
            demo_user.strava_user_token = auth_params["credentials"]["token"]
            demo_user.strava_user_token_expiration = Time.at(auth_params["credentials"]["expires_at"])
            demo_user.strava_user_refresh_token = auth_params["credentials"]["refresh_token"]
            demo_user.strava_authorized = true
            demo_user.strava_uid = auth_params["uid"]
            demo_user.save
            p "demo save"
          end
         end
        # could go to model and write something called before_save for all the token and expirations
        existing_user.save

        if user_signed_in?
          SocialAccount.get_provider_account(current_user.id,provider.id).first_or_create(user_id: current_user.id ,  authentication_provider_id: provider.id , token: auth_params.try(:[],"credentials").try(:[],"token") , secret: auth_params.try(:[],"credentials").try(:[],"secret"))
          redirect_to new_user_registration_url

        # all these other cases will never happen if we login before strava oauth
        # elsif authentication
        #   create_authentication_and_sign_in(auth_params, existing_user, provider)
        # else
      #     create_user_and_authentication_and_sign_in(auth_params, provider)
        end
      end

      # def sign_in_with_existing_authentication(authentication)
      #   sign_in_and_redirect(:user, authentication.user)
      # end

      # def create_authentication_and_sign_in(auth_params, user, provider)
      #   UserAuthentication.create_from_omniauth(auth_params, user, provider)
      #   sign_in_and_redirect(:user, user) 
      # end

      # def create_user_and_authentication_and_sign_in(auth_params, provider)
      #   user = User.create_from_omniauth(auth_params)
      #   if user.valid?
      #       create_authentication_and_sign_in(auth_params, user, provider)
      #   else
      #       flash[:error] = user.errors.full_messages.first
      #       redirect_to new_user_registration_url
      #   end
      # end
end