-- ============================================================
--  DATN-demo  |  Luxury Perfume E-Commerce
--  Database schema  –  MySQL 8.x
-- ============================================================

CREATE DATABASE IF NOT EXISTS datn_perfume
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE datn_perfume;

-- ============================================================
-- 1. USERS  (admins + registered customers)
-- ============================================================
CREATE TABLE users (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  full_name     VARCHAR(120)    NOT NULL,
  email         VARCHAR(191)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,
  phone         VARCHAR(20)     DEFAULT NULL,
  avatar_url    VARCHAR(500)    DEFAULT NULL,
  role          ENUM('admin','customer') NOT NULL DEFAULT 'customer',
  is_active     TINYINT(1)      NOT NULL DEFAULT 1,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ============================================================
-- 2. ADDRESSES  (shipping addresses for customers)
-- ============================================================
CREATE TABLE addresses (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED    NOT NULL,
  recipient     VARCHAR(120)    NOT NULL,
  phone         VARCHAR(20)     NOT NULL,
  address_line  VARCHAR(255)    NOT NULL,
  ward          VARCHAR(100)    DEFAULT NULL,
  district      VARCHAR(100)    DEFAULT NULL,
  city          VARCHAR(100)    NOT NULL,
  is_default    TINYINT(1)      NOT NULL DEFAULT 0,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_addresses_user (user_id),
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 3. BRANDS
-- ============================================================
CREATE TABLE brands (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name        VARCHAR(120)  NOT NULL,
  slug        VARCHAR(140)  NOT NULL,
  logo_url    VARCHAR(500)  DEFAULT NULL,
  description TEXT          DEFAULT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_brands_slug (slug)
) ENGINE=InnoDB;

-- ============================================================
-- 4. CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)  NOT NULL,
  slug        VARCHAR(120)  NOT NULL,
  parent_id   INT UNSIGNED  DEFAULT NULL,             -- supports sub-categories
  description TEXT          DEFAULT NULL,
  sort_order  SMALLINT      NOT NULL DEFAULT 0,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_parent (parent_id),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Sample category values (insert via seed script):
-- Eau de Parfum, Eau de Toilette, Extrait de Parfum, Cologne, Gift Set, Home Fragrance

-- ============================================================
-- 5. PRODUCTS
-- ============================================================
CREATE TABLE products (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name            VARCHAR(200)    NOT NULL,
  slug            VARCHAR(220)    NOT NULL,
  brand_id        INT UNSIGNED    DEFAULT NULL,
  category_id     INT UNSIGNED    DEFAULT NULL,
  description     TEXT            DEFAULT NULL,
  -- Fragrance profile
  scent_intensity TINYINT UNSIGNED DEFAULT NULL,       -- 1-10
  longevity       TINYINT UNSIGNED DEFAULT NULL,       -- 1-10
  sillage         TINYINT UNSIGNED DEFAULT NULL,       -- 1-10
  -- Pricing
  price           DECIMAL(15,2)   NOT NULL,            -- in VND
  old_price       DECIMAL(15,2)   DEFAULT NULL,
  -- Display
  image           VARCHAR(500)    DEFAULT NULL,        -- primary image URL
  badge           VARCHAR(50)     DEFAULT NULL,        -- e.g. 'NEW', 'SALE', 'HOT'
  -- Aggregate rating (denormalised; recalculated from reviews)
  rating          DECIMAL(3,2)    DEFAULT NULL,
  review_count    INT UNSIGNED    NOT NULL DEFAULT 0,
  -- Lifecycle
  is_active       TINYINT(1)      NOT NULL DEFAULT 1,
  is_featured     TINYINT(1)      NOT NULL DEFAULT 0,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_slug (slug),
  KEY idx_products_brand    (brand_id),
  KEY idx_products_category (category_id),
  KEY idx_products_active   (is_active),
  CONSTRAINT fk_products_brand    FOREIGN KEY (brand_id)    REFERENCES brands(id)     ON DELETE SET NULL,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 6. PRODUCT IMAGES  (gallery)
-- ============================================================
CREATE TABLE product_images (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  product_id  INT UNSIGNED  NOT NULL,
  url         VARCHAR(500)  NOT NULL,
  alt_text    VARCHAR(200)  DEFAULT NULL,
  sort_order  SMALLINT      NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_product_images_product (product_id),
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 7. PRODUCT VARIANTS  (e.g. 30 ml, 50 ml, 100 ml)
-- ============================================================
CREATE TABLE product_variants (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  product_id  INT UNSIGNED    NOT NULL,
  size_label  VARCHAR(20)     NOT NULL,               -- '30ml', '50ml', '100ml'
  price       DECIMAL(15,2)   NOT NULL,               -- may differ from base price
  old_price   DECIMAL(15,2)   DEFAULT NULL,
  stock       INT             NOT NULL DEFAULT 0,
  sku         VARCHAR(80)     DEFAULT NULL,
  is_active   TINYINT(1)      NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_variant_sku (sku),
  KEY idx_variants_product (product_id),
  CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 8. FRAGRANCE NOTES
-- ============================================================
CREATE TABLE fragrance_notes (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  product_id  INT UNSIGNED  NOT NULL,
  layer       ENUM('top','heart','base') NOT NULL,
  note        VARCHAR(100)  NOT NULL,                 -- e.g. 'Bergamot', 'Rose'
  PRIMARY KEY (id),
  KEY idx_notes_product (product_id),
  CONSTRAINT fk_notes_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 9. REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  product_id  INT UNSIGNED    NOT NULL,
  user_id     INT UNSIGNED    DEFAULT NULL,           -- NULL = guest review
  author_name VARCHAR(120)    NOT NULL,
  rating      TINYINT UNSIGNED NOT NULL,              -- 1-5
  comment     TEXT            DEFAULT NULL,
  is_approved TINYINT(1)      NOT NULL DEFAULT 0,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reviews_product (product_id),
  KEY idx_reviews_user    (user_id),
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL,
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- ============================================================
-- 10. PROMO CODES
-- ============================================================
CREATE TABLE promo_codes (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  code            VARCHAR(50)     NOT NULL,
  discount_type   ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
  discount_value  DECIMAL(10,2)   NOT NULL,           -- % or VND amount
  min_order_value DECIMAL(15,2)   DEFAULT NULL,       -- minimum cart total to apply
  max_uses        INT             DEFAULT NULL,       -- NULL = unlimited
  used_count      INT             NOT NULL DEFAULT 0,
  expires_at      DATETIME        DEFAULT NULL,
  is_active       TINYINT(1)      NOT NULL DEFAULT 1,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_promo_code (code)
) ENGINE=InnoDB;

-- ============================================================
-- 11. ORDERS
-- ============================================================
CREATE TABLE orders (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id           INT UNSIGNED    DEFAULT NULL,     -- NULL = guest checkout
  -- Customer snapshot (kept even if user is deleted)
  customer_name     VARCHAR(120)    NOT NULL,
  customer_email    VARCHAR(191)    NOT NULL,
  customer_phone    VARCHAR(20)     DEFAULT NULL,
  -- Shipping address snapshot
  shipping_address  VARCHAR(255)    NOT NULL,
  shipping_ward     VARCHAR(100)    DEFAULT NULL,
  shipping_district VARCHAR(100)    DEFAULT NULL,
  shipping_city     VARCHAR(100)    NOT NULL,
  -- Pricing
  subtotal          DECIMAL(15,2)   NOT NULL,
  discount_amount   DECIMAL(15,2)   NOT NULL DEFAULT 0,
  shipping_fee      DECIMAL(15,2)   NOT NULL DEFAULT 0,
  tax_amount        DECIMAL(15,2)   NOT NULL DEFAULT 0,
  total             DECIMAL(15,2)   NOT NULL,
  -- Promo code applied
  promo_code_id     INT UNSIGNED    DEFAULT NULL,
  promo_code_used   VARCHAR(50)     DEFAULT NULL,     -- snapshot of code string
  -- Payment
  payment_method    ENUM('cod','atm_card','vietqr') NOT NULL DEFAULT 'cod',
  payment_status    ENUM('unpaid','paid','refunded')          NOT NULL DEFAULT 'unpaid',
  -- Fulfillment
  status            ENUM('pending','confirmed','shipping','delivered','cancelled')
                    NOT NULL DEFAULT 'pending',
  note              TEXT            DEFAULT NULL,
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orders_user   (user_id),
  KEY idx_orders_status (status),
  KEY idx_orders_email  (customer_email),
  CONSTRAINT fk_orders_user       FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE SET NULL,
  CONSTRAINT fk_orders_promo_code FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 12. ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  order_id    INT UNSIGNED    NOT NULL,
  product_id  INT UNSIGNED    DEFAULT NULL,
  variant_id  INT UNSIGNED    DEFAULT NULL,
  -- Snapshots (prices/names at time of purchase)
  product_name VARCHAR(200)   NOT NULL,
  size_label  VARCHAR(20)     DEFAULT NULL,
  unit_price  DECIMAL(15,2)   NOT NULL,
  quantity    SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  subtotal    DECIMAL(15,2)   NOT NULL,               -- unit_price * quantity
  image_url   VARCHAR(500)    DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_order_items_order   (order_id),
  KEY idx_order_items_product (product_id),
  CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)   REFERENCES orders(id)          ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)         ON DELETE SET NULL,
  CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 13. CONTACTS  (customer inquiry form)
-- ============================================================
CREATE TABLE contacts (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name        VARCHAR(120)  NOT NULL,
  email       VARCHAR(191)  NOT NULL,
  phone       VARCHAR(20)   DEFAULT NULL,
  subject     VARCHAR(200)  NOT NULL,
  message     TEXT          NOT NULL,
  is_read     TINYINT(1)    NOT NULL DEFAULT 0,
  replied_at  DATETIME      DEFAULT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contacts_email (email)
) ENGINE=InnoDB;

-- ============================================================
-- 14. WISHLIST
-- ============================================================
CREATE TABLE wishlists (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED  NOT NULL,
  product_id  INT UNSIGNED  NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
  CONSTRAINT fk_wishlist_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 15. BANNERS  (homepage slider / promotions)
-- ============================================================
CREATE TABLE banners (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  title       VARCHAR(200)  DEFAULT NULL,
  subtitle    VARCHAR(300)  DEFAULT NULL,
  image_url   VARCHAR(500)  NOT NULL,
  link_url    VARCHAR(500)  DEFAULT NULL,
  sort_order  SMALLINT      NOT NULL DEFAULT 0,
  is_active   TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ============================================================
-- SAMPLE SEED DATA
-- ============================================================

-- Admin user  (password: admin123  →  store a bcrypt hash in production)
INSERT INTO users (full_name, email, password_hash, role) VALUES
('Admin', 'admin@parfume.vn', '$2b$12$placeholder_bcrypt_hash', 'admin');

-- Brands
INSERT INTO brands (name, slug) VALUES
('Luxe Parfums',      'luxe-parfums'),
('Marine Collection', 'marine-collection'),
('Artisan Scents',    'artisan-scents'),
('Floral Dreams',     'floral-dreams'),
('Maison d\'Oré',     'maison-dore'),
('Tom Ford',          'tom-ford'),
('Byredo',            'byredo'),
('Le Labo',           'le-labo'),
('Diptyque',          'diptyque');

-- Categories
INSERT INTO categories (name, slug, sort_order) VALUES
('Eau de Parfum',     'eau-de-parfum',     1),
('Eau de Toilette',   'eau-de-toilette',   2),
('Extrait de Parfum', 'extrait-de-parfum', 3),
('Cologne',           'cologne',           4),
('Gift Set',          'gift-set',          5),
('Home Fragrance',    'home-fragrance',    6);

-- Promo codes
INSERT INTO promo_codes (code, discount_type, discount_value, min_order_value) VALUES
('SAVE20',    'percent', 20,  500000),
('WELCOME10', 'percent', 10,  0),
('FREESHIP',  'fixed',   30000, 0);

-- ============================================================
-- MIGRATION: nếu database đã tồn tại với enum cũ, chạy lệnh này:
-- ALTER TABLE orders MODIFY COLUMN status
--   ENUM('pending','confirmed','shipping','delivered','cancelled')
--   NOT NULL DEFAULT 'pending';
-- ============================================================
