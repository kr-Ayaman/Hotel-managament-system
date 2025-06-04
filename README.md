# Hotel Management System 🏨

A comprehensive backend database system for managing the various operations of a hotel. This system is designed to handle guest information, room and banquet hall bookings, service requests, restaurant orders, payments, staff management, and guest feedback.

---
## ✨ Features

* **Guest Management**: Supports guest registration with OTP verification and securely stores guest profiles.
* **Booking Management**: Facilitates seamless booking for both rooms and banquet halls.
* **Service Management**: Allows guests to book additional hotel services like Spa, Gym, Airport Pickups, etc.
* **Restaurant Integration**: Manages a complete restaurant menu and tracks food orders linked to guest bookings.
* **Staff Management**: Maintains a detailed record of hotel staff, their roles, salaries, and contact information.
* **Integrated Payments**: Consolidates costs from rooms, services, and restaurant orders into a single, unified payment record.
* **Feedback System**: Collects guest ratings and comments to help improve hotel services.
* **Communication Channel**: Includes a system to receive and store messages from potential guests.

---
## 🛠️ Getting Started

Follow these instructions to set up the database on your local machine.

### Prerequisites

Make sure you have a **MySQL server** installed and running on your system.

### Installation

1.  **Save the Script**: Save the SQL code provided below into a file named `database_setup.sql`.

2.  **Connect to MySQL**: Open your terminal or command prompt and connect to your MySQL client.
    ```sh
    mysql -u YOUR_USERNAME -p
    ```
    Replace `YOUR_USERNAME` with your actual MySQL username. You will be prompted to enter your password.

3.  **Run the Script**: Once connected, use the `SOURCE` command to execute the script. This will create the database, tables, triggers, and populate them with initial data.
    ```sql
    SOURCE /path/to/your/database_setup.sql;
    ```
    Replace `/path/to/your/` with the actual path to where you saved the `database_setup.sql` file.

---
## 🚀 SQL Setup Script

Here is the complete SQL script to initialize the database for the Hotel Management System.

```sql
--
-- Database: `hm`
--
CREATE DATABASE IF NOT EXISTS hm;
USE hm;

-- --------------------------------------------------------

--
-- Table structure for table `receive_message`
--
CREATE TABLE receive_message(
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    message VARCHAR(200) NOT NULL
);

-- --------------------------------------------------------

--
-- Table structure for table `pending_verifications`
--
CREATE TABLE pending_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(15) NOT NULL,
    passwords VARCHAR(80),
    address VARCHAR(255) NOT NULL,
    otp INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    otp_expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 10 MINUTE)
);

-- --------------------------------------------------------

--
-- Table structure for table `guest`
--
CREATE TABLE guest (
    guest_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    passwords VARCHAR(80),
    address VARCHAR(255) NOT NULL
);

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--
CREATE TABLE rooms (
    room_id INT PRIMARY KEY,
    room_type ENUM('Single', 'Double', 'Large'),
    price_per_night DECIMAL(10, 2) NOT NULL
);

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--
CREATE TABLE booking (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT,
    room_id INT,
    booking_date DATETIME DEFAULT NOW(),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    room_amount DECIMAL(10, 2) NOT NULL,
    total_room_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (guest_id) REFERENCES guest(guest_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

-- --------------------------------------------------------

--
-- Table structure for table `banquet_hall`
--
CREATE TABLE banquet_hall (
    hall_id INT PRIMARY KEY,
    capacity INT NOT NULL,
    price_per_hour DECIMAL(10, 2) NOT NULL
);

-- --------------------------------------------------------

--
-- Table structure for table `banquet_hall_booking`
--
create table banquet_hall_booking(
	hall_booking_id INT auto_increment primary key,
	guest_id INT,
    hall_id INT,
    occasion TEXT,
    booking_date DATETIME DEFAULT NOW(),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    banquet_hall_rent DECIMAL(10 , 2) NOT NULL,
    total_banquet_hall_rent DECIMAL(10 , 2) NOT NULL,
    FOREIGN KEY (hall_id) REFERENCES banquet_hall(hall_id),
    FOREIGN KEY (guest_id) REFERENCES guest(guest_id)
);

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--
CREATE TABLE staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hire_date DATETIME DEFAULT NOW(),
    salary DECIMAL(10, 2) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    passwords VARCHAR(80) NOT NULL
);

-- --------------------------------------------------------

--
-- Table structure for table `services`
--
CREATE TABLE services(
	service_name VARCHAR(100) UNIQUE NOT NULL,
	description TEXT,
    services_price DECIMAL(10, 2) NOT NULL
);

-- --------------------------------------------------------

--
-- Table structure for table `service_booking`
--
CREATE TABLE service_booking (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) UNIQUE,
    booking_id INT,
    hall_booking_id int,
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
    FOREIGN KEY (hall_booking_id) REFERENCES banquet_hall_booking(hall_booking_id),
    FOREIGN KEY (service_name) references services(service_name)
);

-- --------------------------------------------------------

--
-- Table structure for table `restaurant`
--
CREATE TABLE restaurant (
    menu_item VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    veg_or_non_veg ENUM('Veg', 'Non-Veg'),
    category ENUM('south indian','roti','chinese','sabzi','chicken','soup','drinks','combo','burger','pizza','roll')
);

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_booking`
--
CREATE TABLE restaurant_booking (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    hall_booking_id int,
    menu_items_ordered TEXT,
    order_date DATETIME DEFAULT NOW(),
    restaurant_cost DECIMAL(10, 2) NOT NULL,
    total_restaurant_cost DECIMAL(10, 2) NOT NULL,
    mark_as_complete BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
    FOREIGN KEY (hall_booking_id) REFERENCES banquet_hall_booking(hall_booking_id)
);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    hall_booking_id int,
    total_room_amount DECIMAL(10, 2),
    services_price DECIMAL(10, 2),
    total_restaurant_cost DECIMAL(10, 2),
    total_banquet_hall_rent DECIMAL(10, 2),
    total_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
    FOREIGN KEY (hall_booking_id) REFERENCES banquet_hall_booking(hall_booking_id)
);

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--
CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    hall_booking_id int,
    feedback_date DATETIME DEFAULT NOW(),
    rating INT CHECK(rating >= 1 AND rating <= 5),
    comments TEXT,
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
    FOREIGN KEY (hall_booking_id) REFERENCES banquet_hall_booking(hall_booking_id)
);

-- --------------------------------------------------------

--
-- Triggers
--
DELIMITER $$
CREATE TRIGGER before_insert_pending_verifications
BEFORE INSERT ON pending_verifications
FOR EACH ROW
BEGIN
    IF NEW.first_name = '' THEN SET NEW.first_name = NULL; END IF;
    IF NEW.last_name = '' THEN SET NEW.last_name = NULL; END IF;
    IF NEW.email = '' THEN SET NEW.email = NULL; END IF;
    IF NEW.phone_number = '' THEN SET NEW.phone_number = NULL; END IF;
    IF NEW.passwords = '' THEN SET NEW.passwords = NULL; END IF;
    IF NEW.address = '' THEN SET NEW.address = NULL; END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER before_update_pending_verifications
BEFORE UPDATE ON pending_verifications
FOR EACH ROW
BEGIN
    IF NEW.first_name = '' THEN SET NEW.first_name = NULL; END IF;
    IF NEW.last_name = '' THEN SET NEW.last_name = NULL; END IF;
    IF NEW.email = '' THEN SET NEW.email = NULL; END IF;
    IF NEW.phone_number = '' THEN SET NEW.phone_number = NULL; END IF;
    IF NEW.passwords = '' THEN SET NEW.passwords = NULL; END IF;
    IF NEW.address = '' THEN SET NEW.address = NULL; END IF;
END$$
DELIMITER ;

-- --------------------------------------------------------
--
-- Inserting sample data
--
-- --------------------------------------------------------

INSERT INTO receive_message (first_name, last_name, email, message) VALUES
('John', 'Doe', 'john.doe@example.com', 'Looking forward to my stay.'),
('Jane', 'Smith', 'jane.smith@example.com', 'Can I get a room with a view?'),
('Alice', 'Johnson', 'alice.j@example.com', 'What facilities do you offer?'),
('Bob', 'Williams', 'bob.w@example.com', 'Is parking available?'),
('Charlie', 'Brown', 'charlie.b@example.com', 'What are the restaurant timings?'),
('Laura', 'Miller', 'laura.m@example.com', 'Do you have a gym?'),
('Jake', 'Anderson', 'jake.a@example.com', 'Looking forward to visiting.'),
('Mia', 'Moore', 'mia.m@example.com', 'Can I get an early check-in?'),
('Liam', 'Taylor', 'liam.t@example.com', 'Do you provide airport pickup?'),
('Sophia', 'White', 'sophia.w@example.com', 'Can I book a hall for a birthday party?');

INSERT INTO pending_verifications (first_name, last_name, email, phone_number, passwords, address, otp) VALUES
('Emily', 'Davis', 'emily.d@example.com', '1234567890', 'password1', '123 Main St', 123456),
('Chris', 'Brown', 'chris.b@example.com', '9876543210', 'password2', '456 Elm St', 654321),
('Michael', 'Clark', 'michael.c@example.com', '4561237890', 'password3', '789 Oak St', 111222),
('Sophia', 'Williams', 'sophia.w@example.com', '7896541230', 'password4', '321 Cedar St', 333444),
('Jacob', 'Walker', 'jacob.w@example.com', '1239874560', 'password5', '654 Spruce St', 555666),
('Emma', 'Martin', 'emma.m@example.com', '7891234560', 'password6', '987 Walnut St', 777888),
('Olivia', 'Harris', 'olivia.h@example.com', '4567891230', 'password7', '567 Chestnut St', 999000),
('Ava', 'Scott', 'ava.s@example.com', '3214569870', 'password8', '432 Birch St', 111333),
('Isabella', 'Hall', 'isabella.h@example.com', '6543217890', 'password9', '654 Maple St', 444555),
('Noah', 'Green', 'noah.g@example.com', '1236547890', 'password10', '321 Pine St', 888999);

INSERT INTO guest (first_name, last_name, email, phone_number, passwords, address) VALUES
('Anna', 'Taylor', 'anna.t@example.com', '1112223333', 'guestpass1', '123 Pine St'),
('Tom', 'Harris', 'tom.h@example.com', '4445556666', 'guestpass2', '456 Maple St'),
('Sarah', 'Wilson', 'sarah.w@example.com', '7778889999', 'guestpass3', '789 Birch St'),
('David', 'Moore', 'david.m@example.com', '2223334444', 'guestpass4', '123 Elm St'),
('Ella', 'King', 'ella.k@example.com', '5556667777', 'guestpass5', '456 Cedar St'),
('James', 'Young', 'james.y@example.com', '8889990000', 'guestpass6', '789 Walnut St'),
('Grace', 'Carter', 'grace.c@example.com', '1113335555', 'guestpass7', '321 Spruce St'),
('Jack', 'Baker', 'jack.b@example.com', '6668880000', 'guestpass8', '654 Chestnut St'),
('Lily', 'Adams', 'lily.a@example.com', '9991113333', 'guestpass9', '432 Oak St'),
('Zoe', 'Ward', 'zoe.w@example.com', '3335557777', 'guestpass10', '654 Maple St');

INSERT INTO rooms (room_id, room_type, price_per_night) VALUES
(101, 'Single', 1000.00),
(102, 'Single', 1200.00),
(103, 'Double', 2000.00),
(104, 'Double', 2200.00),
(105, 'Large', 3000.00),
(106, 'Large', 3500.00),
(107, 'Single', 1100.00),
(108, 'Double', 2100.00),
(109, 'Large', 3200.00),
(110, 'Large', 3600.00);

INSERT INTO booking (guest_id, room_id, check_in_date, check_out_date, room_amount, total_room_amount) VALUES
(1, 101, '2024-11-10', '2024-11-12', 2000.00, 2000.00),
(2, 103, '2024-11-15', '2024-11-18', 4000.00, 4000.00),
(3, 105, '2024-11-18', '2024-11-20', 9000.00, 9000.00),
(4, 102, '2024-11-01', '2024-11-03', 2400.00, 2400.00),
(5, 104, '2024-11-25', '2024-11-28', 6600.00, 6600.00),
(6, 106, '2024-11-07', '2024-11-09', 10500.00, 10500.00),
(7, 108, '2024-11-22', '2024-11-25', 6300.00, 6300.00),
(8, 107, '2024-11-04', '2024-11-07', 3300.00, 3300.00),
(9, 109, '2024-11-20', '2024-11-24', 12800.00, 12800.00),
(10, 110, '2024-11-28', '2024-12-02', 14400.00, 14400.00);

INSERT INTO services (service_name, description, services_price) VALUES
('Spa', 'Relaxing spa treatments.', 1500.00),
('Gym', 'Access to the fitness center.', 800.00),
('Swimming Pool', 'Access to the hotel swimming pool.', 2000.00),
('Wi-Fi', 'High-speed internet access.', 500.00),
('Parking', 'Secure parking spot.', 300.00),
('Laundry', 'Laundry and dry cleaning service.', 1000.00),
('Restaurant Meal', 'A full course meal at our in-house restaurant.', 1200.00),
('Airport Pickup', 'Transportation service from the airport.', 2500.00),
('Conference Room', 'Booking of a fully equipped conference room.', 5000.00),
('Room Cleaning', 'Daily room cleaning service.', 600.00);

-- Note: Add INSERT statements for the remaining tables (`banquet_hall`, `banquet_hall_booking`, `staff`, etc.) as needed.
