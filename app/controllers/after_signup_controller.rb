class AfterSignupController < ApplicationController
    include Wicked::Wizard

    steps :strava, :google

    def show
        render_wizard
    end
end
