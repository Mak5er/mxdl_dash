-- Safe, additive indexes for Downloader-Bot dashboard query patterns.
-- Review on a staging database before applying to production.

CREATE INDEX IF NOT EXISTS ix_downloaded_files_date_added
  ON downloaded_files(date_added);

CREATE INDEX IF NOT EXISTS ix_downloaded_files_file_type
  ON downloaded_files(file_type);

CREATE INDEX IF NOT EXISTS ix_users_user_username
  ON users(user_username);

CREATE INDEX IF NOT EXISTS ix_users_chat_type
  ON users(chat_type);

CREATE INDEX IF NOT EXISTS ix_users_language
  ON users(language);

CREATE INDEX IF NOT EXISTS ix_users_status
  ON users(status);

CREATE INDEX IF NOT EXISTS ix_analytics_events_user_id_created_at
  ON analytics_events(user_id, created_at);

CREATE INDEX IF NOT EXISTS ix_analytics_events_action_name_created_at
  ON analytics_events(action_name, created_at);

CREATE INDEX IF NOT EXISTS ix_analytics_events_chat_type_created_at
  ON analytics_events(chat_type, created_at);

