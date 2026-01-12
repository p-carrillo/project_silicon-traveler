-- Fixture 000: Initial post data
CREATE TABLE IF NOT EXISTS post (
  id INT PRIMARY KEY AUTO_INCREMENT,
  value VARCHAR(255) NOT NULL
);

INSERT INTO post (value) VALUES ('DB works');

-- Journey module tables
CREATE TABLE IF NOT EXISTS journey (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  description TEXT NULL,
  status ENUM('draft', 'active', 'completed') NOT NULL DEFAULT 'draft',
  start_date DATE NULL,
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS journey_stop (
  id CHAR(36) PRIMARY KEY,
  journey_id CHAR(36) NOT NULL,
  title VARCHAR(128) NOT NULL,
  city VARCHAR(128) NULL,
  country VARCHAR(128) NULL,
  description TEXT NULL,
  sequence INT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (journey_id) REFERENCES journey(id)
);

CREATE TABLE IF NOT EXISTS prompt_template (
  id CHAR(36) PRIMARY KEY,
  key_name VARCHAR(64) NOT NULL UNIQUE,
  kind ENUM('image', 'text') NOT NULL,
  template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS journey_entry (
  id CHAR(36) PRIMARY KEY,
  journey_id CHAR(36) NOT NULL,
  journey_stop_id CHAR(36) NOT NULL,
  travel_date DATE NOT NULL,
  stage_index INT NOT NULL,
  image_url VARCHAR(512) NOT NULL,
  image_storage_key VARCHAR(256) NOT NULL,
  text_body TEXT NOT NULL,
  image_prompt_id CHAR(36) NOT NULL,
  text_prompt_id CHAR(36) NOT NULL,
  image_model VARCHAR(64) NOT NULL,
  text_model VARCHAR(64) NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (journey_id) REFERENCES journey(id),
  FOREIGN KEY (journey_stop_id) REFERENCES journey_stop(id),
  FOREIGN KEY (image_prompt_id) REFERENCES prompt_template(id),
  FOREIGN KEY (text_prompt_id) REFERENCES prompt_template(id),
  UNIQUE (journey_id, travel_date)
);
