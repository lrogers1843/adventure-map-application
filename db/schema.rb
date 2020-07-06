# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_07_06_041803) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "activities", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.float "distance"
    t.float "total_elevation_gain"
    t.integer "moving_time"
    t.integer "elapsed_time"
    t.datetime "start_date"
    t.float "start_lat"
    t.float "start_lng"
    t.float "end_lat"
    t.float "end_lng"
    t.string "workout_type"
    t.string "polymap"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "user_id"
    t.text "map_coords", default: [], array: true
    t.datetime "start_date_utc"
    t.index ["user_id"], name: "index_activities_on_user_id"
  end

  create_table "authentication_providers", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_name_on_authentication_providers"
  end

  create_table "delayed_jobs", force: :cascade do |t|
    t.integer "priority", default: 0, null: false
    t.integer "attempts", default: 0, null: false
    t.text "handler", null: false
    t.text "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string "locked_by"
    t.string "queue"
    t.datetime "created_at", precision: 6
    t.datetime "updated_at", precision: 6
    t.index ["priority", "run_at"], name: "delayed_jobs_priority"
  end

  create_table "social_accounts", force: :cascade do |t|
    t.string "token"
    t.string "secret"
    t.bigint "user_id"
    t.bigint "authentication_provider_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["authentication_provider_id"], name: "index_social_accounts_on_authentication_provider_id"
    t.index ["user_id"], name: "index_social_accounts_on_user_id"
  end

  create_table "user_authentications", force: :cascade do |t|
    t.integer "user_id"
    t.integer "authentication_provider_id"
    t.string "uid"
    t.string "token"
    t.datetime "token_expires_at"
    t.text "params"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["authentication_provider_id"], name: "index_user_authentications_on_authentication_provider_id"
    t.index ["user_id"], name: "index_user_authentications_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "first_name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "provider"
    t.string "uid"
    t.string "last_name"
    t.string "strava_user_token"
    t.string "strava_user_refresh_token"
    t.integer "strava_user_token_expiration"
    t.jsonb "strava_data"
    t.jsonb "google_oauth2_data"
    t.string "google_access_token"
    t.datetime "google_access_token_expiration"
    t.string "google_refresh_token"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "social_accounts", "authentication_providers"
  add_foreign_key "social_accounts", "users"
end
