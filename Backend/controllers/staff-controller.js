const pool = require('../models/db');
const HttpError = require('../models/http-error');
const moment = require("moment")
const bcrypt = require('bcrypt');
const { registerUser } = require('../common/register')
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'supersecret_dont_share_staff';
const booking_gst = 1.18
const restaurant_gst = 1.05
const services_gst = 1.18
exports.addEmployee = async (req, res, next) => {
    const { firstName, lastName, position, email, salary, contactNumber, password } = req.body;

    try {
        const [existingStaff] = await pool.query(
            `SELECT staff_id FROM staff WHERE email = ?`,
            [email]
        );

        if (existingStaff.length > 0) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            `INSERT INTO staff (first_name, last_name, position, email, salary, contact_number, passwords)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [firstName, lastName, position, email, salary, contactNumber, hashedPassword]
        );

        res.status(201).json({ message: 'Staff registered successfully'});
    } catch (error) {
        console.log(error);
        
        return next(new HttpError("Error in registering staff", 500));
    }
};


exports.signin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const [result] = await pool.query(
            `SELECT staff_id, position, passwords FROM staff WHERE email = ?`,
            [email]
        );

        if (result.length === 0) {
            return res.status(404).json({ message: 'Staff not found' });
        }

        const staffPass = result[0].passwords;

        // const isPasswordValid = await bcrypt.compare(password, staffPass);
        const isPasswordValid = staffPass==password;
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {position: result[0].position},
            JWT_SECRET,
            { expiresIn: '24h' }
        );        
        res.json({
            message: 'Account creation successful',
            position: result[0].position,
            token,
            staffId: result[0].staff_id
          });
    } catch (error) {
        console.log(error);
        
        next(new HttpError("Error in signing staff", 500));
    }
};

exports.getOrders = async (req, res, next) => {
    const position = req.userData.position;
    
    if (!(position === 'Restaurant Staff'|| position =='Chef' || position === 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403));
    }

    try {
        // Fetch not completed orders        
        const [notCompletedOrders] = await pool.query(
            `SELECT r.order_id, 
                    b.room_id, 
                    bh.hall_id, 
                    r.menu_items_ordered, 
                    r.order_date, 
                    r.restaurant_cost, 
                    r.total_restaurant_cost, 
                    r.mark_as_complete
             FROM restaurant_booking r
             LEFT JOIN booking b ON r.booking_id = b.booking_id
             LEFT JOIN banquet_hall_booking bh ON r.hall_booking_id = bh.hall_booking_id
             WHERE r.mark_as_complete = FALSE`
        );
        
        // Fetch completed orders
        const [completedOrders] = await pool.query(
            `SELECT r.order_id, 
            b.room_id, 
            bh.hall_id, 
            r.menu_items_ordered, 
            r.order_date, 
            r.restaurant_cost, 
            r.total_restaurant_cost, 
            r.mark_as_complete
            FROM restaurant_booking r
            LEFT JOIN booking b ON r.booking_id = b.booking_id
            LEFT JOIN banquet_hall_booking bh ON r.hall_booking_id = bh.hall_booking_id
            WHERE r.mark_as_complete = TRUE`
        );
        
        res.json({
            notCompletedOrders,
            completedOrders
        });       
    } catch (error) {
        console.log(error);
        return next(new HttpError("Failed to retrieve orders", 500));
    }
};
exports.markOrderComplete = async (req, res, next) => {
    const { orderid } = req.params;
    const position = req.userData.position;
    
    if (!(position === 'Restaurant Staff'|| position =='Chef' || position === 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403));
    }

    try {
        const [result] = await pool.query(
            "UPDATE restaurant_booking SET mark_as_complete = TRUE WHERE order_id = ?",
            [orderid]
        );

        if (result.affectedRows === 0) {
            return next(new HttpError("Order not found", 404));
        }
        res.json({message:"Done"});
    } catch (err) {
        return next(new HttpError("Failed to mark order as complete", 500));
    }
};


exports.signupUser = async (req, res, next) => {
    const position = req.userData.position
    if (!(position == 'Receptionist' || position == 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403))
    }
    const { first_name, last_name, email, phone_number, address } = req.body;
    const [existingUser] = await pool.query('SELECT * FROM guest WHERE email = ?', [email]);
    if (existingUser.length > 0) {
        return next(new HttpError('Email is already in use.', 409));
    }
    try {
        password=null
        const result = await registerUser({ first_name, last_name, email, phone_number, password, address });

        res.status(201).json({ result });
        console.log(result);
    } catch (error) {
        return next(new HttpError('Could not sign up user', 500))
    }
}

exports.getUsers = async (req, res, next) =>{
    const position = req.userData.position
    if (!(position == 'Receptionist' || position == 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403))
    }
    try{

        const [result] = await pool.query(`SELECT guest_id,first_name, last_name, email, phone_number, address FROM guest`)
        res.status(201).json({ result });
    }catch(error){
        return next(new HttpError('Could not get user details', 500))
    }
}

exports.getCurrentRoomBookings= async (req, res, next) =>{
    const position = req.userData.position
    if (!(position == 'Receptionist' || position == 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403))
    }
    try{
        const [result] = await pool.query(`SELECT 
            b.booking_id, 
            b.room_id, 
            b.check_in_date, 
            b.check_out_date, 
            r.room_type, 
            g.guest_id, 
            g.phone_number
        FROM booking AS b
        JOIN rooms AS r ON b.room_id = r.room_id
        JOIN guest AS g ON b.guest_id = g.guest_id
        WHERE b.check_in_date <= CURDATE() 
        AND b.check_out_date >= CURDATE();
        `)
        res.status(201).json({ result });
    }catch(error){
        return next(new HttpError('Could not get booking details', 500))
    }
}
exports.getUpcomingRoomBookings= async (req, res, next) =>{
    const position = req.userData.position
    if (!(position == 'Receptionist' || position == 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403))
    }
    try{
        const [result] = await pool.query(`SELECT 
            b.booking_id, 
            b.room_id, 
            b.check_in_date, 
            b.check_out_date, 
            r.room_type, 
            g.guest_id, 
            g.phone_number
        FROM booking AS b
        JOIN rooms AS r ON b.room_id = r.room_id
        JOIN guest AS g ON b.guest_id = g.guest_id
        WHERE b.check_in_date >= CURDATE();
        `)
        res.status(201).json({ result });
    }catch(error){
        return next(new HttpError('Could not get booking details', 500))
    }
}
exports.getPastRoomBookings= async (req, res, next) =>{
    const position = req.userData.position
    if (!(position == 'Receptionist' || position == 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403))
    }
    try{
        const [result] = await pool.query(`SELECT 
            b.booking_id, 
            b.room_id, 
            b.check_in_date, 
            b.check_out_date, 
            r.room_type, 
            g.guest_id, 
            g.phone_number
        FROM booking AS b
        JOIN rooms AS r ON b.room_id = r.room_id
        JOIN guest AS g ON b.guest_id = g.guest_id
        WHERE b.check_out_date <= CURDATE();
        `)
        res.status(201).json({ result });
    }catch(error){
        return next(new HttpError('Could not get booking details', 500))
    }
}
exports.getCurrentBanquetBookings = async (req, res, next) => {
    const position = req.userData.position;
    if (!(position === 'Receptionist' || position === 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403));
    }

    try {
        const [result] = await pool.query(`
            SELECT 
                b.hall_booking_id, 
                b.guest_id, 
                b.hall_id, 
                b.occasion, 
                b.check_in_date, 
                b.check_out_date, 
                g.phone_number
            FROM banquet_hall_booking AS b
            JOIN banquet_hall AS bh ON b.hall_id = bh.hall_id
            JOIN guest AS g ON b.guest_id = g.guest_id
            WHERE b.check_in_date <= CURDATE() 
            AND b.check_out_date >= CURDATE();
        `);

        res.status(201).json({ result });
    } catch (error) {
        return next(new HttpError('Could not get banquet booking details', 500));
    }
};
exports.getUpcomingBanquetBookings = async (req, res, next) => {
    const position = req.userData.position;
    if (!(position === 'Receptionist' || position === 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403));
    }

    try {
        const [result] = await pool.query(`
            SELECT 
                b.hall_booking_id, 
                b.guest_id, 
                b.hall_id, 
                b.occasion, 
                b.check_in_date, 
                b.check_out_date, 
                g.phone_number
            FROM banquet_hall_booking AS b
            JOIN banquet_hall AS bh ON b.hall_id = bh.hall_id
            JOIN guest AS g ON b.guest_id = g.guest_id
            WHERE b.check_in_date >= CURDATE();
        `);

        res.status(201).json({ result });
    } catch (error) {
        return next(new HttpError('Could not get banquet booking details', 500));
    }
};

exports.getPastBanquetBookings = async (req, res, next) => {
    const position = req.userData.position;
    if (!(position === 'Receptionist' || position === 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403));
    }

    try {
        const [result] = await pool.query(`
            SELECT 
                b.hall_booking_id, 
                b.guest_id, 
                b.hall_id, 
                b.occasion, 
                b.check_in_date, 
                b.check_out_date, 
                g.phone_number
            FROM banquet_hall_booking AS b
            JOIN banquet_hall AS bh ON b.hall_id = bh.hall_id
            JOIN guest AS g ON b.guest_id = g.guest_id
            WHERE b.check_out_date <= CURDATE();
        `);

        res.status(201).json({ result });
    } catch (error) {
        return next(new HttpError('Could not get banquet booking details', 500));
    }
};

exports.removeEmployee = async (req, res, next) => {
    const { staffid } = req.params; 
    const position = req.userData.position
    if (position != 'Manager') {
        return next(new HttpError("You are not allowed to make this request", 403))
    }
    try {
        const [result] = await pool.query(
            `DELETE FROM staff WHERE staff_id = ?`,
            [staffid]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        res.status(200).json({ message: 'Staff member removed successfully' });
    } catch (error) {
        return next(new HttpError("Error in registering staff", 500));
    }
};

exports.getStaffs = async (req,res, next) =>{
    const position = req.userData.position
    
    if (position != 'Manager') {
        return next(new HttpError("You are not allowed to make this request", 403))
    }
    try{
        const [result] = await pool.query("SELECT staff_id, first_name, last_name, position, salary FROM staff")
        res.status(200).json({result})
    }catch(error){
        return next(new HttpError("Error getting staff details"))
    }
}

exports.getStaffdetail = async (req, res, next) =>{
    const {staffid}= req.params
    
    const position = req.userData.position
    if(!position){
        return next(new HttpError("You are not allowed to maeke this request", 400))
    }
    try{
        const [result] = await pool.query("SELECT staff_id, first_name, last_name, position, email, hire_date, salary,contact_number FROM staff WHERE staff_id = ?",[staffid])
        
        res.status(200).json({result})   
        console.log(result);
             
    }catch(error){
        console.log(error);        
        return next(new HttpError("Error getting staff details"))
    }
}

exports.getAvailableRooms = async (req, res, next) => {
    const position = req.userData.position;
    const { check_in_date, check_out_date, room_types } = req.body;
  
    if (!position) {
      return next(new HttpError("You are not allowed to make this request", 400));
    }
  
    if (!check_in_date || !check_out_date || !room_types || room_types.length === 0) {
      return next(new HttpError("Invalid filters provided", 400));
    }
  
    try {
      const placeholders = room_types.map(() => "?").join(", ");
      const query = `
        SELECT r.room_id, r.price_per_night, r.room_type
        FROM rooms r
        WHERE r.room_type IN (${placeholders})
          AND NOT EXISTS (
            SELECT 1
            FROM booking b
            WHERE b.room_id = r.room_id
              AND NOT (b.check_out_date <= ? OR b.check_in_date >= ?)
          );
      `;
  
      const [availableRooms] = await pool.query(
        query,
        [...room_types, check_in_date, check_out_date]
      );
  
      res.status(200).json({ rooms: availableRooms });
    } catch (error) {
      return next(new HttpError("Error in getting available rooms", 500));
    }
  };
  exports.bookRoom = async (req, res, next) => {
        const { email, room_id, check_in_date, check_out_date } = req.body;
    const position = req.userData.position;
    if(!(position=="Receptionist"|| position == "Manager")){
        return next(new HttpError("You are not authorized to complete this request", 402))
    }
        
        const connection = await pool.getConnection();
      
        try {
          await connection.beginTransaction();
            const [guest] = await connection.query("SELECT guest_id FROM guest WHERE email =?",[email])
            if(guest.length === 0){
                return next(new HttpError("No such guest exists", 400))
            }
            const [price] = await connection.query(
                `
                SELECT r.price_per_night
          FROM rooms r
          WHERE r.room_id = ?
            AND NOT EXISTS (
              SELECT 1
              FROM booking b
              WHERE b.room_id = r.room_id
                AND NOT (b.check_out_date <= ? OR b.check_in_date >= ?)
            )`,
                [room_id, check_in_date, check_out_date]
              );
            if(price == 0){
                return next(new HttpError("Room is already booked for this date", 403))
            }
          const pricePerNight = price[0].price_per_night;
          const nights = moment(check_out_date).diff(moment(check_in_date), 'days');
      
          if (nights <= 0) {
            await connection.rollback();
            return next(new HttpError('Invalid inputs passed, please check your data.', 422));
          }
          const guest_id=guest[0].guest_id
          const roomAmount = pricePerNight * nights;
          const totalRoomAmount = roomAmount * booking_gst;
      
          const [result] = await connection.query(
            `INSERT INTO booking (guest_id, room_id, booking_date, check_in_date, check_out_date, room_amount, total_room_amount)
               VALUES (?, ?, CURDATE(), ?, ?, ?, ?)`,
            [guest_id, room_id, check_in_date, check_out_date, roomAmount, totalRoomAmount]
          );
      
          const bookingId = result.insertId;
      
          await connection.query(
            `INSERT INTO payments (booking_id, total_room_amount, services_price, total_restaurant_cost, total_amount)
               VALUES (?, ?, 0, 0, ?)`,
            [bookingId, totalRoomAmount, totalRoomAmount]
          );
      
          await connection.commit();
          console.log("room booked");
      
          res.status(201).json({ message: 'Booking created successfully', bookingId });
        } catch (error) {
          await connection.rollback();
          console.error(error);
          return next(new HttpError('Error occurred while booking the room', 500));
        } finally {
          connection.release();
        }      
  }

  exports.bookBanquet = async (req, res, next) => {
    const { hall_id, email, occasion, check_in_date, check_out_date } = req.body;
    const position = req.userData.position;
    if(!(position=="Receptionist"|| position == "Manager")){
        return next(new HttpError("You are not authorized to complete this request", 402))
    }
  
    const connection = await pool.getConnection();
  
    try {
      await connection.beginTransaction();
      const [guest] = await connection.query("SELECT guest_id FROM guest WHERE email =?",[email])
        if(guest.length === 0){
            return next(new HttpError("No such guest exists", 400))
        }
      const [availableHalls] = await connection.query(
        `
        SELECT h.price_per_hour
        FROM banquet_hall h
        WHERE h.hall_id = ?
        AND NOT EXISTS (
        SELECT 1
        FROM banquet_hall_booking b
        WHERE b.hall_id = h.hall_id
        AND NOT (b.check_out_date <= ? OR b.check_in_date >= ?)
        )`,
        [hall_id, check_in_date, check_out_date]
      );
  
      if (availableHalls.length === 0) {
        return next(new HttpError('No banquet halls available of the specified capacity for dates.', 503));
      }
      const pricePerHour = availableHalls[0].price_per_hour;
      const days = moment(check_out_date).diff(moment(check_in_date), 'days');
  
      if (days <= 0) {
        await connection.rollback();
        return next(new HttpError('Invalid dates, please check your inputs.', 422));
      }
  
      const banquetHallRent = pricePerHour * days * 24;
      const totalBanquetHallRent = banquetHallRent * booking_gst;
      const guest_id = guest[0].guest_id
      const [result] = await connection.query(
        `INSERT INTO banquet_hall_booking (guest_id, hall_id, occasion, check_in_date, check_out_date, banquet_hall_rent, total_banquet_hall_rent)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [guest_id, hall_id, occasion, check_in_date, check_out_date, banquetHallRent, totalBanquetHallRent]
      );
  
      const hallBookingId = result.insertId;
  
      await connection.query(
        `INSERT INTO payments (hall_booking_id, services_price, total_restaurant_cost, total_banquet_hall_rent, total_amount) 
         VALUES (?, 0, 0, ?, ?)`,
        [hallBookingId, totalBanquetHallRent, totalBanquetHallRent]
      );
  
      await connection.commit();
      res.status(201).json({ message: 'Banquet booking created successfully', hallBookingId });
    } catch (error) {
      await connection.rollback();
      console.error(error);
      return next(new HttpError('Error booking banquet hall.', 500));
    } finally {
      connection.release();
    }
  };

  exports.getAvailableBanquets = async (req, res, next) => {
    const position = req.userData.position; // Get position from user data
    const { check_in_date, check_out_date, capacity } = req.body; // Destructure filters from request body
  
    if (!position) {
      return next(new HttpError("You are not allowed to make this request", 400));
    }
  
    if (!check_in_date || !check_out_date || !capacity) {
      return next(new HttpError("Invalid filters provided", 400));
    }
  
    try {
      const [availableHalls] = await pool.query(
        `
        SELECT h.hall_id, h.capacity, h.price_per_hour
        FROM banquet_hall h
        WHERE h.capacity >= ? 
          AND NOT EXISTS (
            SELECT 1
            FROM banquet_hall_booking b
            WHERE b.hall_id = h.hall_id
              AND NOT (b.check_out_date <= ? OR b.check_in_date >= ?)
          )
        ORDER BY h.capacity ASC;
        `,
        [capacity, check_in_date, check_out_date]
      );
      console.log(availableHalls);
      
      res.status(200).json({ banquets: availableHalls });
    } catch (error) {
      console.error(error);
      return next(new HttpError("Error fetching available banquet halls", 500));
    }
  };
  

exports.changeSalary = async (req, res, next) => {
    const { staffid } = req.params;
    const { newSalary } = req.body;
    const position = req.userData.position
    if (position != 'Manager') {
        return next(new HttpError("You are not allowed to make this request", 403))
    }
    try {
        // Update the staff member's salary
        const [result] = await pool.query(
            `UPDATE staff SET salary = ? WHERE staff_id = ?`,
            [newSalary, staffid]
        );

        // Check if a row was updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        res.status(200).json({ message: 'Salary updated successfully' });
    } catch (error) {
        return next(new HttpError('Error in updating salary', 500));  // Pass error to next middleware
    }
};

exports.createRoom = async (req, res, next) => {
    const { roomNo, roomType, price_per_night } = req.body;
    const position = req.userData.position
    if (!(position == 'Receptionist' || position == 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403))
    }
    try {
        // Insert the new room into the rooms table
        const [result] = await pool.query(
            `INSERT INTO rooms (room_id, room_type, price_per_night) VALUES (?, ?, ?)`,
            [roomNo, roomType, price_per_night]
        );

        res.status(201).json({ message: 'Room created successfully' });
    } catch (error) {
        // Check if the error is due to a unique constraint violation (e.g., duplicate room_id)
        if (error.code === 'ER_DUP_ENTRY') {
            return next(new HttpError('Room with this number already exists', 422));
        }
        // Handle other possible errors
        return next(new HttpError('Error creating room', 500));
    }
};


exports.modifyPriceByRoomType = async (req, res, next) => {
    const { roomType } = req.params;  // Get room type (e.g., 'Single', 'Double', 'Large')
    const { newPrice } = req.body;    // New price for all rooms of this type
    const position = req.userData.position
    if (!(position == 'Receptionist' || position == 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403))
    }
    try {
        // Update the price for all rooms of the specified type
        const [result] = await pool.query(
            `UPDATE rooms SET price_per_night = ? WHERE room_type = ?`,
            [newPrice, roomType]
        );

        // Check if any rows were updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No rooms of this type found' });
        }

        res.status(200).json({ message: `Price updated for all ${roomType} rooms` });
    } catch (error) {
        return next(new HttpError("Error in updating room price", 500));
    }
};

exports.createBanquetHall = async (req, res, next) => {
    const { hall_id, capacity, price_per_hour } = req.body;
    const position = req.userData.position
    if (!(position == 'Receptionist' || position == 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403))
    }
    try {
        // Insert a new banquet hall into the banquet_hall table
        const [result] = await pool.query(
            `INSERT INTO banquet_hall (hall_id, capacity, price_per_hour) VALUES (?, ?, ?)`,
            [hall_id, capacity, price_per_hour]
        );

        res.status(201).json({ message: 'Banquet hall created successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return next(new HttpError('Room with this number already exists', 422));
        }
        return next(new HttpError('Error creating banquet hall', 500));
    }
};

exports.modifyPriceForBanquetHall = async (req, res, next) => {
    const { hall_id } = req.params;
    const { newPrice } = req.body;
    const position = req.userData.position
    if (!(position == 'Receptionist' || position == 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403))
    }
    try {
        // Update the price_per_hour for the specified banquet hall
        const [result] = await pool.query(
            `UPDATE banquet_hall SET price_per_hour = ? WHERE hall_id = ?`,
            [newPrice, hall_id]
        );

        // Check if a row was updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Banquet hall not found' });
        }

        res.status(200).json({ message: 'Price updated successfully' });
    } catch (error) {
        return next(new HttpError('Error modifying price for banquet hall', 500));
    }
};

exports.addItemtoMenu = async (req, res, next) => {
    const { menu_item, price, veg_or_non_veg, category } = req.body;
    const position = req.userData.position;
    if (!(position === 'Restaurant Staff'|| position =='Chef' || position === 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403));
    }
    
    const allowedCategories = [
        'south indian', 'chinese', 'sabzi', 'chicken', 'soup', 
        'drinks', 'combo', 'burger', 'pizza', 'roll', 'roti'
    ];

    if (!allowedCategories.includes(category)) {
        return next(new HttpError(`Invalid category. Allowed categories are: ${allowedCategories.join(', ')}`, 422));
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO restaurant (menu_item, price, veg_or_non_veg, category) VALUES (?, ?, ?, ?)`,
            [menu_item, price, veg_or_non_veg, category]
        );

        res.status(201).json({
            message: 'Item added successfully to the menu',
        });
    } catch (error) {
        console.log(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return next(new HttpError('Item already exists', 422));
        }

        return next(new HttpError("Error inserting item to menu", 500));
    }
};

exports.changePriceofItem = async (req, res, next) => {
    const { menu_item, price } = req.body;
    const position = req.userData.position
    if (!(position == 'Restaurant Staff'|| position =='Chef' || position == 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403))
    }
    try {
        // Validate input
        if (price < 0) {
            return next(new HttpError('Invalid inputs. Please check item name and price.', 422));
        }
        // Update the price of the specified menu item
        const [result] = await pool.query(
            'UPDATE restaurant SET price = ? WHERE menu_item = ?',
            [price, menu_item]
        );

        // Check if the item was updated
        if (result.affectedRows === 0) {
            return next(new HttpError(`Item "${menu_item}" not found in the menu.`, 404));
        }
        res.status(200).json({ message: `Price of ${menu_item} updated successfully.` });
        
    } catch (error) {
        return next(new HttpError('Error occurred while updating the price of the item.', 500));
    }
};

exports.checkAvailableRooms = async (req, res, error) => {
    const { room_type } = req.query; // Optional filter for room type
    const position = req.userData.position
    if (!(position == 'Receptionist' || position == 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403))
    }
    try {
        // Base query to find available rooms
        let query = `SELECT room_id, room_type, price_per_night 
                         FROM rooms 
                         WHERE availability_status = TRUE`;
        const params = [];

        // Add room_type filter if provided
        if (room_type) {
            query += ` AND room_type = ?`;
            params.push(room_type);
        }

        // Execute the query
        const [rooms] = await pool.query(query, params);

        // Check if any rooms are available
        if (rooms.length === 0) {
            return next(new HttpError('No available rooms found with the specified criteria.', 404));
        }

        // Respond with available rooms
        res.status(200).json({ availableRooms: rooms });
    } catch (error) {
        console.error(error);
        return next(new HttpError('Error occurred while checking for available rooms', 500));
    }
}

exports.addService = async (req, res, next) => {
    const { service_name, description, services_price } = req.body;
    const position = req.userData.position
    if (!(position == 'Receptionist' || position == 'Manager')) {
        return next(new HttpError("You are not allowed to make this request", 403))
    }

    // Validate inputs
    if (!service_name || typeof services_price !== 'number' || services_price < 0) {
        return next(new HttpError('Invalid inputs. Please provide a valid service name and price.', 422));
    }

    try {
        // Insert the new service
        const [result] = await pool.query(
            `INSERT INTO services (service_name, description, services_price) VALUES (?, ?, ?)`,
            [service_name, description, services_price]
        );

        // Send response
        res.status(201).json({ message: 'Service added successfully' });
    } catch (error) {
        // Check if the error is due to a unique constraint violation
        if (error.code === 'ER_DUP_ENTRY') {
            return next(new HttpError('Service with this name already exists', 422));
        }
        return next(new HttpError('Error adding service to the database', 500));
    }
};