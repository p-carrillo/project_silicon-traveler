-- Fixture 000: Initial post data
CREATE TABLE IF NOT EXISTS post (
  id INT PRIMARY KEY AUTO_INCREMENT,
  value VARCHAR(255) NOT NULL
);

INSERT INTO post (value) VALUES ('DB works');
