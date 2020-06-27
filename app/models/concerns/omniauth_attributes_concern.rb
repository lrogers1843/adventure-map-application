module OmniauthAttributesConcern
    extend ActiveSupport::Concern
    module ClassMethods
        def strava params

            (params['info']['email'] = "dummy#{SecureRandom.hex(10)}@dummy.com") if params['info']['email'].blank?
            attributes = {
                            email: params['info']['email'],
                            first_name: params.info.first_name,  
                            last_name: params.info.last_name, 
                            password: Devise.friendly_token[0, 20],
                            strava_user_token: params.credentials.token, 
                            strava_user_refresh_token: params.credentials.refresh_token, 
                            strava_user_token_expiration: params.credentials.expires_at,
                            response: params,
                            strava_uid: params.uid
                        }
            create(attributes)
        end

        # We can add other social media accounts the same way we have added above

    end
end