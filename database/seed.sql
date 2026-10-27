-- Seed data for Online Voting System
-- Run after schema.sql
-- Use online_voting_system

USE online_voting_system;

INSERT IGNORE INTO users (full_name, email, password_hash, role, is_active) VALUES
('Alice Johnson', 'alice@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'voter', TRUE),
('Bob Smith', 'bob@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'voter', TRUE),
('Charlie Brown', 'charlie@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'voter', TRUE),
('Diana Prince', 'diana@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'voter', TRUE),
('Ethan Hunt', 'ethan@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'voter', TRUE);

INSERT IGNORE INTO elections (id, title, description, start_time, end_time, status, results_visible) VALUES
(1, 'Student Council Election 2025', 'Annual student council representative election.', '2025-10-01 00:00:00', '2025-10-15 23:59:59', 'closed', TRUE),
(2, 'Club President Election 2026', 'Election for the president of the coding club.', '2026-10-01 00:00:00', '2026-11-30 23:59:59', 'published', FALSE);

INSERT IGNORE INTO candidates (id, election_id, name, party_name, description, photo) VALUES
(1, 1, 'Sarah Connor', 'Independent', 'Experienced leader with focus on student welfare.', NULL),
(2, 1, 'John Wick', 'Action Party', 'Dedicated to improving campus facilities.', NULL),
(3, 1, 'Ellen Ripley', 'Progressive', 'Advocate for better academic resources.', NULL),
(4, 2, 'Neo Anderson', 'Tech Alliance', 'Focused on modernizing club activities.', NULL),
(5, 2, 'Trinity', 'Innovators', 'Promotes inclusivity in tech events.', NULL),
(6, 2, 'Morpheus', 'Wisdom Group', 'Experienced mentor for new members.', NULL);

INSERT IGNORE INTO votes (election_id, voter_id, candidate_id) VALUES
(1, 1, 1),
(1, 2, 2),
(1, 3, 1),
(1, 4, 3),
(1, 5, 2);
