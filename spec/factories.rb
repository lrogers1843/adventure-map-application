FactoryBot.define do
  factory :social_account do
    
  end

  factory :user_authentication do
    
  end

  factory :authentication_provider do
    
  end

  factory :user do
    name { "MyString" }
  end

  factory :activity do
    name { "MyString" }
    description { "MyString" }
    distance { 1.5 }
    total_elevation_gain { 1.5 }
    moving_time { 1 }
    elapsed_time { 1 }
    start_date { "2020-05-17 10:45:28" }
    start_lat { 1.5 }
    start_lng { 1.5 }
    end_lat { 1.5 }
    end_lng { 1.5 }
    workout_type { 1 }
    polymap { "MyString" }
  end

end
