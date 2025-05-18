USE janypet;

CREATE TABLE user(
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255) NOT NULL,
    gender ENUM('Male','Female','Other'),
    address TEXT,
    role VARCHAR(50) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    refresh_token VARCHAR(500),
    token_expiry BIGINT,
    is_locked BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB ;

CREATE TABLE role(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
) ENGINE = InnoDB;

CREATE TABLE userRole(
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    roleId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (roleId) REFERENCES role (id) ON DELETE CASCADE,
    UNIQUE(userId, roleId)
) ENGINE = InnoDB;

CREATE TABLE category(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE
)ENGINE=InnoDB;

CREATE TABLE product(
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    image VARCHAR(255),
    average_rating FLOAT DEFAULT 0.0,
    review_count INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL
)ENGINE=InnoDB;

CREATE TABLE product_details(
    id INT PRIMARY KEY AUTO_INCREMENT,
    productId INT NOT NULL,
    categoryId INT NOT NULL,
    attributeKey VARCHAR(100) NOT NULL,
    attributeValue VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (productId) REFERENCES product(id) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES category(id) ON DELETE CASCADE
);

CREATE TABLE shopping_carts(
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    total_price DECIMAL(10,2) DEFAULT 0.00,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_details(
    id INT PRIMARY KEY AUTO_INCREMENT,
    shopping_cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (shopping_cart_id) REFERENCES shopping_carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
)ENGINE = InnoDB;

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(50) UNIQUE,
    user_id INT NOT NULL,
    customer_first_name VARCHAR(100),
    customer_last_name VARCHAR(100),
    customer_email VARCHAR(150),
    customer_phone VARCHAR(15),
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_district VARCHAR(100),
    shipping_ward VARCHAR(100),
    shipping_method VARCHAR(50),
    shipping_fee DECIMAL(10,2) DEFAULT 0.00,
    estimated_delivery_date TIMESTAMP NULL,
    payment_method VARCHAR(50),
    subtotal_amount DECIMAL(10,2) NOT NULL,
    coupon_code VARCHAR(50),
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    totalAmount DECIMAL (10,2) NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    paymentStatus ENUM('Pending', 'Paid', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
    orderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_notes TEXT,
    vnp_txn_ref VARCHAR(100),
    vnp_transaction_no VARCHAR(100),
    vnp_bank_code VARCHAR(50),
    vnp_card_type VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
)ENGINE=InnoDB;

CREATE TABLE order_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image VARCHAR(255),
    product_color VARCHAR(50),
    product_size VARCHAR(50),
    quantity INT UNSIGNED NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    item_discount_amount DECIMAL(10,2) DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL UNIQUE,
    transaction_id VARCHAR(100) UNIQUE,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_code VARCHAR(50),
    bank_code VARCHAR(50),
    payment_info TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE review (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    productId INT NOT NULL,
    orderId INT NULL,
    rating TINYINT UNSIGNED CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) NULL,
    comment TEXT,
    image VARCHAR(255),
    is_approved BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES product(id) ON DELETE CASCADE,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE discount (
    id INT PRIMARY KEY AUTO_INCREMENT,
    productId INT NOT NULL,
    discountPercent DECIMAL(5,2) NOT NULL,
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP NOT NULL,
    description VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (productId) REFERENCES product(id) ON DELETE CASCADE,
    CHECK (endDate > startDate)
) ENGINE=InnoDB;

CREATE TABLE cupon (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discountType VARCHAR(50) NOT NULL,
    discountValue DECIMAL(10,2) NOT NULL,
    minOrderAmount DECIMAL(10,2) DEFAULT 0,
    max_order_amount DECIMAL(10,2),
    usageLimit INT DEFAULT 1,
    usedCount INT DEFAULT 0,
    startDate TIMESTAMP NULL,
    expirationDate TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE service (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    small_pet_price DECIMAL(10,2),
    medium_pet_price DECIMAL(10,2),
    large_pet_price DECIMAL(10,2),
    xlarge_pet_price DECIMAL(10,2),
    images TEXT,
    max_pets_per_slot INT DEFAULT 1,
    requires_vaccination BOOLEAN DEFAULT FALSE,
    category VARCHAR(50),
    duration_minutes INT,
    availability VARCHAR(255),
    service_procedure TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    benefits TEXT,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE service_included_items (
    service_id INT NOT NULL,
    item VARCHAR(255) NOT NULL,
    PRIMARY KEY (service_id, item),
    FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE service_item (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    service_id INT,
    small_pet_price DECIMAL(10,2),
    medium_pet_price DECIMAL(10,2),
    large_pet_price DECIMAL(10,2),
    xlarge_pet_price DECIMAL(10,2),
    duration_minutes INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pet (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    birth_date DATE,
    gender VARCHAR(50),
    weight DECIMAL(5,2),
    vaccinated BOOLEAN DEFAULT FALSE,
    health_notes TEXT,
    avatar_url VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE booking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    pet_id INT NOT NULL,
    staff_id INT NULL,
    booking_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    total_price DECIMAL(10,2),
    estimated_duration_minutes INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES pet(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES user(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE booking_service (
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    PRIMARY KEY (booking_id, service_id),
    FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO role (name, description) VALUES ('ROLE_USER', 'Standard user role for Spring Security');
INSERT INTO role (name, description) VALUES ('ROLE_ADMIN', 'Administrator role for Spring Security');
INSERT INTO role (name, description) VALUES ('ROLE_STAFF', 'Staff role for Spring Security');
INSERT INTO role (name, description) VALUES ('ROLE_EMPLOYEE', 'Employee role for Spring Security');
INSERT INTO role (name, description) VALUES ('ROLE_CUSTOMER', 'Customer role for Spring Security');