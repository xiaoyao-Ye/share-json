-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS json_share CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE json_share;

-- 创建用户表
-- CREATE TABLE IF NOT EXISTS users (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   username VARCHAR(50) NOT NULL UNIQUE,
--   password VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- 创建分享文件表
CREATE TABLE IF NOT EXISTS shares (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  expiry_type VARCHAR(255) NOT NULL,
  expiry_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 创建标签表
-- CREATE TABLE IF NOT EXISTS tags (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(50) NOT NULL UNIQUE,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- 创建分享文件和标签的关联表
-- CREATE TABLE IF NOT EXISTS share_tags (
--   share_id INT NOT NULL,
--   tag_id INT NOT NULL,
--   PRIMARY KEY (share_id, tag_id),
--   FOREIGN KEY (share_id) REFERENCES shares(id) ON DELETE CASCADE,
--   FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
-- );

-- 创建评论表
-- CREATE TABLE IF NOT EXISTS comments (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   share_id INT NOT NULL,
--   user_id INT,
--   content TEXT NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (share_id) REFERENCES shares(id) ON DELETE CASCADE,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
-- );

-- 添加一些默认标签
-- INSERT IGNORE INTO tags (name) VALUES 
--   ('文档'), 
--   ('图片'), 
--   ('视频'), 
--   ('音频'), 
--   ('压缩包'),
--   ('JSON'),
--   ('代码'),
--   ('其他'); 