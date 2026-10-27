-- Online Voting System Database Schema
-- Database: online_voting_system
-- Do not drop existing database automatically

CREATE DATABASE IF NOT EXISTS online_voting_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE online_voting_system;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'voter') NOT NULL DEFAULT 'voter',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB;

-- Elections table
CREATE TABLE IF NOT EXISTS elections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status ENUM('draft', 'published', 'closed') NOT NULL DEFAULT 'draft',
  results_visible BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_times (start_time, end_time)
) ENGINE=InnoDB;

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  election_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  party_name VARCHAR(255),
  description TEXT,
  photo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
  UNIQUE KEY uk_candidate_election (id, election_id),
  INDEX idx_election (election_id)
) ENGINE=InnoDB;

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  election_id INT NOT NULL,
  voter_id INT NOT NULL,
  candidate_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_election_voter (election_id, voter_id),
  FOREIGN KEY (election_id) REFERENCES elections(id),
  FOREIGN KEY (voter_id) REFERENCES users(id),
  FOREIGN KEY (candidate_id, election_id) REFERENCES candidates(id, election_id),
  INDEX idx_election_candidate (election_id, candidate_id)
) ENGINE=InnoDB;

-- Session table will be created automatically by express-mysql-session
