const pool = require('../models/db');
const HttpError = require('../models/http-error');
const moment = require('moment');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { registerUser } = require('../common/register')

const JWT_SECRET = 'supersecret_dont_share_guest';

const booking_gst = 1.18
const restaurant_gst = 1.05
const services_gst = 1.18

exports.signup = async (req, res, next) => {
  const { first_name, last_name, email, phone_number, password, address } = req.body;
  if (password.length == 0) {
    return next(new HttpError('Please give a valid password', 409));
  }
  const [existingUser] = await pool.query('SELECT * FROM guest WHERE email = ?', [email]);
  if (existingUser.length > 0 && existingUser[0].passwords != null) {
    return next(new HttpError('Email is already in use.', 409));
  }
  try {

    const result = await registerUser({ first_name, last_name, email, phone_number, password, address });
    res.status(201).json({ result });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
};

exports.verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    const [pendingRecords] = await pool.query(
      'SELECT * FROM pending_verifications WHERE email = ? AND otp = ?',
      [email, otp]
    );

    if (pendingRecords.length === 0) {
      return next(new HttpError('Invalid OTP or email', 400));
    }

    const userData = pendingRecords[0];

    await pool.query(
      `INSERT INTO guest (first_name, last_name, email, phone_number, passwords, address) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       first_name = VALUES(first_name), 
       last_name = VALUES(last_name),
       passwords = VALUES(passwords), 
       address = VALUES(address)`,
      [
        userData.first_name,
        userData.last_name,
        userData.email,
        userData.phone_number,
        userData.passwords,
        userData.address,
      ]
    );

    const [guestRecord] = await pool.query(
      'SELECT guest_id FROM guest WHERE email = ?',
      [email]
    );

    if (guestRecord.length === 0) {
      throw new Error('Guest ID retrieval failed');
    }

    const guestId = guestRecord[0].guest_id;

    await pool.query('DELETE FROM pending_verifications WHERE email = ?', [
      email,
    ]);

    const token = jwt.sign({ guestId }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Account creation successful',
      token,
      guestId,
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return next(new HttpError('Error occurred during OTP verification', 500));
  }
};


exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const [user] = await pool.query('SELECT * FROM guest WHERE email = ?', [email]);
    if (user.length === 0) {
      return next(new HttpError('Invalid credentials', 401));
    }
    psdInDB = user[0].passwords
    if (psdInDB) {
      // const validPassword = await bcrypt.compare(password, psdInDB);
      const validPassword = (password == psdInDB);
      if (!validPassword) {
        return next(new HttpError('Invalid credentials', 401));
      }
    } else {
      return next(new HttpError("Please sign up and set up a valid password", 401))
    }

    const token = jwt.sign(
      { guestId: user[0].guest_id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      guestId: user[0].guest_id,
    });
  } catch (error) {
    console.error('Login error:', error);
    return next(new HttpError('Error occurred during login', 500));
  }
};

exports.getroomsPrice = async (req, res, next) => {
  try {
    const [result] = await pool.query(`SELECT DISTINCT room_type, price_per_night 
        FROM rooms
        WHERE room_type IN ('Single', 'Double', 'Large')`)
    return res.status(200).json(result);
  } catch (error) {
    return next(new HttpError('Error occurred during fetching price', 500));
  }
}
exports.getbanquetsPrice = async (req, res, next) => {
  console.log(1);
  try {
    const [result] = await pool.query(`SELECT capacity, price_per_hour FROM banquet_hall`)
    return res.status(200).json(result);
  } catch (error) {
    return next(new HttpError('Error occurred during fetching price', 500));
  }
}

exports.getUserData = async (req, res, next) => {
  const { guestId } = req.params;
  const userGuestId = req.userData.guest_id || guestId;
  const isStaff = !!req.userData.position;

  if (!isStaff && userGuestId != guestId) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  try {
    const [guestData] = await pool.query(
      `SELECT first_name, last_name, email, phone_number, address FROM guest WHERE guest_id = ?`, [guestId]
    )

    res.json({
      guestData: guestData,
    });
  }
  catch (error) {
    const httpError = new HttpError('Error retrieving guest data', 500);
    console.log(error)
    return next(httpError);
  }
}

exports.getPrice = async (req, res, next) => {
  const { bookingType, room_type, capacity, occasion, check_in_date, check_out_date } = req.body;
  try {
    let calculated_price;
    const checkInDate = moment(check_in_date);
    const checkOutDate = moment(check_out_date);
    const nights = checkOutDate.diff(checkInDate, "days");
    if (nights <= 0) {
      return next(new HttpError("Invalid check-in or check-out dates", 400));
    }

    if (bookingType === "room") {
      // Get price per night for the specified room type
      const [rows] = await pool.query(
        `SELECT price_per_night FROM rooms WHERE room_type = ?`,
        [room_type]
      );

      if (rows.length === 0) {
        return next(new HttpError("Room type not found", 404));
      }

      const price_per_night = rows[0].price_per_night;

      // Calculate the total pric
      calculated_price = price_per_night * nights;

    } else if (bookingType === "banquet") {
      // Get price per hour for the specified banquet capacity
      const [rows] = await pool.query(
        `SELECT price_per_hour FROM banquet_hall WHERE capacity = ?`,
        [capacity]
      );

      if (rows.length === 0) {
        return next(new HttpError("Banquet capacity not found", 404));
      }

      const price_per_hour = rows[0].price_per_hour;

      calculated_price = price_per_hour * 24 * nights;
    } else {
      return next(new HttpError("Invalid booking type", 400));
    }
    res.status(200).json({ price: calculated_price * booking_gst });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Error calculating prices", 500));
  }
};

exports.sendmsg = async (req, res, next) => {
  const { firstName, lastName, email, message } = req.body
  try {
    await pool.query(`INSERT INTO  receive_message (first_name, last_name, email, message)
                      VALUES (?,?,?,?)`, [firstName, lastName, email, message])
    res.json({ message: "Message sent" })
  }
  catch (error) {
    console.log(error);

    return next(new HttpError("Error sending message", 500))
  }
}

exports.getMenuItems = async (req, res, next) => {
  try {
    const [result] = await pool.query(`SELECT menu_item, price, veg_or_non_veg, category FROM restaurant`);
    res.status(200).json({ result })
  } catch (error) {
    return next(HttpError("Error getting menu items", 500))
  }
}

exports.getServices = async (req, res, next) => {
  try {
    const [result] = await pool.query(`SELECT service_name, description, services_price FROM services`)
    res.status(200).json({ result })
  } catch (error) {
    return next(new HttpError("Error getting services", 500))
  }
}

exports.getBookingsByGuestId = async (req, res, next) => {
  const { guestId } = req.params;
  const userGuestId = req.userData.guest_id || guestId;
  const isStaff = !!req.userData.position;

  if (!isStaff && userGuestId != guestId) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  try {
    const [roomBookingRows] = await pool.query(
      `SELECT b.booking_id, b.room_id, b.check_in_date, b.check_out_date, r.room_type
       FROM booking as b
       JOIN rooms as r ON b.room_id = r.room_id
       WHERE guest_id = ?`,
      [guestId]
    );

    const [banquetBookingRows] = await pool.query(
      `SELECT bhb.hall_booking_id, bhb.hall_id, bhb.occasion, bhb.check_in_date, bhb.check_out_date, bh.capacity
       FROM banquet_hall_booking as bhb
       JOIN banquet_hall as bh ON bhb.hall_id = bh.hall_id
       WHERE guest_id = ?`,
      [guestId]
    );

    res.json({
      roomBookings: roomBookingRows,
      banquetBookings: banquetBookingRows,
    });
  } catch (error) {
    const httpError = new HttpError('Error retrieving booking data', 500);
    return next(httpError);
  }
};

exports.getRoomBookingData = async (req, res, next) => {
  const { booking_id } = req.params;
  const userGuestId = req.userData.guest_id || -1;
  const isStaff = !!req.userData.position;

  try {
    const [bookingRows] = await pool.query(
      `SELECT booking.booking_id, booking.guest_id, booking_date, booking.room_id, check_in_date, check_out_date, room_amount, total_room_amount, rooms.room_type
      FROM booking
      JOIN rooms ON booking.room_id = rooms.room_id
      WHERE booking_id = ?`, [booking_id]
    );
    if (!bookingRows.length) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingGuestId = bookingRows[0].guest_id;

    if (!isStaff && bookingGuestId != userGuestId) {
      return next(new HttpError("Unauthorized Access", 403));
    }

    const [orderRows] = await pool.query(
      `SELECT order_id, menu_items_ordered, order_date, restaurant_cost, total_restaurant_cost 
       FROM restaurant_booking 
       WHERE booking_id = ?`, [booking_id]
    );
    const parsedOrders = await Promise.all(orderRows.map(async (order) => {
      const items = order.menu_items_ordered.split(', ').map(item => {
        const [quantityWithX, ...itemNameParts] = item.split(' ');
        const quantity = parseInt(quantityWithX.replace('x', ''));
        const itemName = itemNameParts.join(' ').trim();
        return { itemName, quantity };
      });

      const itemDetails = await Promise.all(items.map(async ({ itemName, quantity }) => {
        const [itemRow] = await pool.query(`SELECT menu_item, price FROM restaurant WHERE menu_item = ?`, [itemName]);
        if (itemRow.length) {
          const { menu_item, price } = itemRow[0];
          return { item: menu_item, quantity, price, total: price * quantity };
        }
        return null;
      }));

      return {
        order_id: order.order_id,
        order_date: order.order_date,
        items: itemDetails.filter(detail => detail !== null),
        total_cost: order.total_restaurant_cost,
      };
    }));
    // Fetch payments related to the room booking
    const [paymentRows] = await pool.query(
      `SELECT payment_id, total_room_amount, services_price, total_restaurant_cost, total_amount 
       FROM payments 
       WHERE booking_id = ?`, [booking_id]
    );

    // Fetch any services requested for this room booking
    const [serviceRows] = await pool.query(
      `SELECT service_id, service_booking.service_name, services_price  
       FROM service_booking 
       JOIN services ON service_booking.service_name = services.service_name
       WHERE booking_id = ?`, [booking_id]
    );

    res.json({
      booking: bookingRows,
      orders: parsedOrders,
      services: serviceRows,
      payments: paymentRows,
    });

  } catch (error) {
    const httpError = new HttpError('Error getting room booking data', 500);
    return next(httpError);
  }
};
exports.getHallBookingData = async (req, res, next) => {
  const { hall_booking_id } = req.params;
  const userGuestId = req.userData.guest_id || -1;
  const isStaff = !!req.userData.position;

  try {
    const [banquetRows] = await pool.query(`
      SELECT bhb.guest_id, bhb.hall_booking_id, bhb.booking_date, bhb.hall_id, 
             bhb.occasion, bhb.check_in_date, bhb.check_out_date, 
             bhb.banquet_hall_rent, bhb.total_banquet_hall_rent, bh.capacity 
      FROM banquet_hall_booking AS bhb
      JOIN banquet_hall AS bh ON bhb.hall_id = bh.hall_id
      WHERE bhb.hall_booking_id = ?`, [hall_booking_id]);

    if (!banquetRows.length) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingGuestId = banquetRows[0].guest_id;

    if (!isStaff && bookingGuestId != userGuestId) {
      return next(new HttpError("Unauthorized Access", 403));
    }

    // Fetch restaurant orders for this hall booking
    const [orderRows] = await pool.query(`
      SELECT order_id, menu_items_ordered, order_date, restaurant_cost, total_restaurant_cost 
      FROM restaurant_booking 
      WHERE hall_booking_id = ?`, [hall_booking_id]);

    const parsedOrders = await Promise.all(orderRows.map(async (order) => {
      const items = order.menu_items_ordered.split(', ').map(item => {
        const [quantityWithX, ...itemNameParts] = item.split(' ');
        const quantity = parseInt(quantityWithX.replace('x', ''));
        const itemName = itemNameParts.join(' ').trim();
        return { itemName, quantity };
      });

      const itemDetails = await Promise.all(items.map(async ({ itemName, quantity }) => {
        const [itemRow] = await pool.query(`SELECT menu_item, price FROM restaurant WHERE menu_item = ?`, [itemName]);
        if (itemRow.length) {
          const { menu_item, price } = itemRow[0];
          return { item: menu_item, quantity, price, total: price * quantity };
        }
        return null;
      }));

      return {
        order_id: order.order_id,
        order_date: order.order_date,
        items: itemDetails.filter(detail => detail !== null),
        total_cost: order.total_restaurant_cost,
      };
    }));

    // Fetch services
    const [serviceRows] = await pool.query(`
      SELECT service_id, service_booking.service_name, services_price
      FROM service_booking 
      JOIN services ON service_booking.service_name = services.service_name
      WHERE hall_booking_id = ?`, [hall_booking_id]);

    // Fetch payment details
    const [paymentRows] = await pool.query(`
      SELECT payment_id, services_price, total_restaurant_cost, 
             total_banquet_hall_rent, total_amount 
      FROM payments 
      WHERE hall_booking_id = ?`, [hall_booking_id]);

    res.json({
      banquetBooking: banquetRows,
      orders: parsedOrders,
      services: serviceRows,
      payments: paymentRows,
    });
  } catch (error) {
    return next(new HttpError('Error getting banquet hall booking data', 500));
  }
};

exports.createRoomBooking = async (req, res, next) => {
  const { guest_id } = req.params;
  const { bookingType, room_type, check_in_date, check_out_date } = req.body;
  console.log(guest_id);
  
  const userGuestId = req.userData.guest_id || guest_id;
  const isStaff = !!req.userData.position;

  if (!isStaff && userGuestId != guest_id) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [availableRooms] = await connection.query(
      `
      SELECT r.room_id, r.price_per_night
FROM rooms r
WHERE r.room_type = ?
  AND NOT EXISTS (
    SELECT 1
    FROM booking b
    WHERE b.room_id = r.room_id
      AND NOT (b.check_out_date <= ? OR b.check_in_date >= ?)
  )
LIMIT 1;
      `,
      [room_type, check_in_date, check_out_date]
    );
    console.log(availableRooms);

    if (availableRooms.length === 0) {
      return next(new HttpError(`Rooms of type ${room_type} are fully booked or unavailable for the selected dates.`, 503));
    }

    const roomId = availableRooms[0].room_id;
    const pricePerNight = availableRooms[0].price_per_night;
    const nights = moment(check_out_date).diff(moment(check_in_date), 'days');

    if (nights <= 0) {
      await connection.rollback();
      return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const roomAmount = pricePerNight * nights;
    const totalRoomAmount = roomAmount * booking_gst;

    const [result] = await connection.query(
      `INSERT INTO booking (guest_id, room_id, booking_date, check_in_date, check_out_date, room_amount, total_room_amount)
         VALUES (?, ?, CURDATE(), ?, ?, ?, ?)`,
      [guest_id, roomId, check_in_date, check_out_date, roomAmount, totalRoomAmount]
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
};


exports.createBanquetBooking = async (req, res, next) => {
  const { guest_id } = req.params;
  const { capacity, occasion, check_in_date, check_out_date } = req.body;

  const userGuestId = req.userData.guest_id || guest_id;
  const isStaff = !!req.userData.position;

  if (!isStaff && userGuestId != guest_id) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [availableHalls] = await connection.query(
      `
      SELECT h.hall_id, h.price_per_hour
      FROM banquet_hall h
      WHERE h.capacity = ?
      AND NOT EXISTS (
      SELECT 1
      FROM banquet_hall_booking b
      WHERE b.hall_id = h.hall_id
      AND NOT (b.check_out_date <= ? OR b.check_in_date >= ?)
      )
      LIMIT 1;
      `,
      [capacity, check_in_date, check_out_date]
    );

    if (availableHalls.length === 0) {
      return next(new HttpError('No banquet halls available of the specified capacity for dates.', 503));
    }

    const hallId = availableHalls[0].hall_id;
    const pricePerHour = availableHalls[0].price_per_hour;
    const days = moment(check_out_date).diff(moment(check_in_date), 'days');

    if (days <= 0) {
      await connection.rollback();
      return next(new HttpError('Invalid dates, please check your inputs.', 422));
    }

    const banquetHallRent = pricePerHour * days * 24;
    const totalBanquetHallRent = banquetHallRent * booking_gst;

    // Insert banquet hall booking record
    const [result] = await connection.query(
      `INSERT INTO banquet_hall_booking (guest_id, hall_id, occasion, check_in_date, check_out_date, banquet_hall_rent, total_banquet_hall_rent)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [guest_id, hallId, occasion, check_in_date, check_out_date, banquetHallRent, totalBanquetHallRent]
    );

    const hallBookingId = result.insertId;

    // Insert payment record
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


exports.orderFoodinRoom = async (req, res, next) => {
  const { booking_id } = req.params;
  const { menu_items_ordered } = req.body;

  const guest_id = req.userData.guest_id;

  if (!guest_id) {
    if (!req.userData.position) {
      return next(new HttpError('Unauthorized: Staff or guest authentication required.', 401));
    }
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [bookingRows] = await connection.query(
      `SELECT booking_id, guest_id, check_out_date FROM booking WHERE booking_id = ?`,
      [booking_id]
    );

    if (bookingRows.length === 0) {
      return next(new HttpError('Booking not found.', 404));
    }

    if (!(req.userData.position || bookingRows[0].guest_id == guest_id)) {
      return next(new HttpError('Unauthorized to access this booking.', 403));
    }

    const checkOutDate = new Date(bookingRows[0].check_out_date);
    const currentDate = new Date();

    checkOutDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    if (checkOutDate <= currentDate) {
      return next(HttpError("Check out has already been done", 409))
    }

    const orderedItems = menu_items_ordered.split(",").map(item => {
      const [quantity, itemName] = item.trim().split("x").map(s => s.trim());
      return { item: itemName, quantity: parseInt(quantity) || 1 };
    });

    const itemNames = orderedItems.map(item => item.item);

    const [menuRows] = await connection.query(
      `SELECT menu_item, price FROM restaurant WHERE menu_item IN (?)`,
      [itemNames]
    );

    if (menuRows.length !== itemNames.length) {
      await connection.rollback();
      const error = new HttpError("Some food items are not available on the menu.", 422);
      return next(error);
    }

    let restaurantCost = orderedItems.reduce((total, orderedItem) => {
      const menuItem = menuRows.find(row => row.menu_item === orderedItem.item);
      return total + (menuItem.price * orderedItem.quantity);
    }, 0);

    const totalRestaurantCost = (restaurantCost * 1.05).toFixed(2);

    const formattedOrder = orderedItems.map(item => `${item.quantity}x ${item.item}`).join(", ");
    const [result] = await connection.query(
      `INSERT INTO restaurant_booking (booking_id, menu_items_ordered, restaurant_cost, total_restaurant_cost)
         VALUES (?, ?, ?, ?)`,
      [booking_id, formattedOrder, restaurantCost, totalRestaurantCost]
    );

    await connection.query(
      `UPDATE payments SET total_restaurant_cost = total_restaurant_cost + ?, total_amount = total_amount + ?
      WHERE booking_id = ?`,
      [totalRestaurantCost, totalRestaurantCost, booking_id]
    );

    await connection.commit();
    res.status(201).json({
      message: 'Food order placed successfully',
      orderId: result.insertId,
      restaurantCost: restaurantCost,
      totalRestaurantCost: totalRestaurantCost
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    const httpError = new HttpError('Error ordering food in room', 500);
    return next(httpError);
  } finally {
    connection.release();
  }
};

exports.orderFoodInHall = async (req, res, next) => {
  const { hall_booking_id } = req.params;
  const { menu_items_ordered } = req.body;
  const guest_id = req.userData.guest_id;

  if (!guest_id) {
    if (!req.userData.position) {
      return next(new HttpError('Unauthorized: Staff or guest authentication required.', 401));
    }
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [bookingRows] = await connection.query(
      `SELECT guest_id, check_out_date FROM banquet_hall_booking WHERE hall_booking_id = ?`,
      [hall_booking_id]
    );

    if (bookingRows.length === 0) {
      return next(new HttpError('Booking not found.', 404));
    }

    if (!(req.userData.position || bookingRows[0].guest_id == guest_id)) {
      return next(new HttpError('Unauthorized access to this booking.', 403));
    }
    const checkOutDate = new Date(bookingRows[0].check_out_date);
    const currentDate = new Date();

    checkOutDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    if (checkOutDate <= currentDate) {
      return next(HttpError("Check out has already been done", 409))
    }
    const orderedItems = menu_items_ordered.split(",").map(item => {
      const [quantity, itemName] = item.trim().split("x").map(s => s.trim());
      return { item: itemName, quantity: parseInt(quantity) || 1 };
    });

    const itemNames = orderedItems.map(item => item.item);

    const [menuRows] = await connection.query(
      `SELECT menu_item, price FROM restaurant WHERE menu_item IN (?)`,
      [itemNames]
    );

    if (menuRows.length !== itemNames.length) {
      await connection.rollback();
      const error = new HttpError("Some food items are not available on the menu.", 422);
      return next(error);
    }

    let restaurantCost = orderedItems.reduce((total, orderedItem) => {
      const menuItem = menuRows.find(row => row.menu_item === orderedItem.item);
      return total + (menuItem.price * orderedItem.quantity);
    }, 0);

    const totalRestaurantCost = (restaurantCost * restaurant_gst).toFixed(2);

    const formattedOrder = orderedItems.map(item => `${item.quantity}x ${item.item}`).join(", ");

    const [result] = await connection.query(
      `INSERT INTO restaurant_booking (hall_booking_id, menu_items_ordered, restaurant_cost, total_restaurant_cost)
         VALUES (?, ?, ?, ?)`,
      [hall_booking_id, formattedOrder, restaurantCost, totalRestaurantCost]
    );

    await connection.query(
      `UPDATE payments SET total_restaurant_cost = total_restaurant_cost + ?, total_amount = total_amount + ?
      WHERE hall_booking_id = ?`,
      [totalRestaurantCost, totalRestaurantCost, hall_booking_id]
    );

    await connection.commit();
    res.status(201).json({
      message: 'Food order placed successfully in banquet hall',
      orderId: result.insertId,
      restaurantCost: restaurantCost,
      totalRestaurantCost: totalRestaurantCost
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    const httpError = new HttpError('Error ordering food in banquet hall', 500);
    return next(httpError);
  } finally {
    connection.release();
  }
};



exports.submitRoomFeedback = async (req, res, next) => {
  const { booking_id } = req.params;
  const { rating, comments } = req.body;
  const guest_id = req.userData.guest_id;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [bookingRows] = await connection.query(
      `SELECT guest_id FROM booking WHERE booking_id = ?`,
      [booking_id]
    );

    if (bookingRows.length === 0) {
      return next(new HttpError('Booking not found.', 404));
    }

    if (bookingRows[0].guest_id != guest_id) {
      return next(new HttpError('Unauthorized access to this booking.', 403));
    }

    // Check if feedback already exists
    const [existingFeedback] = await pool.query(
      `SELECT feedback_id FROM feedback WHERE booking_id = ?`,
      [booking_id]
    );

    if (existingFeedback.length > 0) {
      await pool.query(
        `UPDATE feedback SET rating = ?, comments = ? WHERE booking_id = ?`,
        [rating, comments, booking_id]
      );
      res.status(200).json({ message: 'Room booking feedback updated successfully' });
    } else {
      // Insert new feedback
      await pool.query(
        `INSERT INTO feedback (booking_id, rating, comments) VALUES (?, ?, ?)`,
        [booking_id, rating, comments]
      );
      res.status(201).json({ message: 'Room booking feedback submitted successfully' });
    }
  } catch (error) {
    console.log(error)
    const httpError = new HttpError('Error submitting feedback for room booking', 500);
    return next(httpError);
  }
};

// Hall booking feedback
exports.submitHallFeedback = async (req, res, next) => {
  const { hall_booking_id } = req.params;
  const { rating, comments } = req.body;
  const guest_id = req.userData.guest_id;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [bookingRows] = await connection.query(
      `SELECT guest_id FROM banquet_hall_booking WHERE hall_booking_id = ?`,
      [hall_booking_id]
    );

    if (bookingRows.length === 0) {
      return next(new HttpError('Booking not found.', 404));
    }

    if (bookingRows[0].guest_id != guest_id) {
      return next(new HttpError('Unauthorized access to this booking.', 403));
    }

    const [existingFeedback] = await pool.query(
      `SELECT feedback_id FROM feedback WHERE hall_booking_id = ?`,
      [hall_booking_id]
    );

    if (existingFeedback.length > 0) {
      await pool.query(
        `UPDATE feedback SET rating = ?, comments = ? WHERE hall_booking_id = ?`,
        [rating, comments, hall_booking_id]
      );
      res.status(200).json({ message: 'Hall booking feedback updated successfully' });
    } else {
      await pool.query(
        `INSERT INTO feedback (hall_booking_id, rating, comments) VALUES (?, ?, ?)`,
        [hall_booking_id, rating, comments]
      );
      res.status(201).json({ message: 'Hall booking feedback submitted successfully', feedbackId: result.insertId });
    }
  } catch (error) {
    console.log(error);
    const httpError = new HttpError('Error submitting feedback for hall booking', 500);
    return next(httpError);
  }
};


exports.requestRoomService = async (req, res, next) => {
  const { booking_id } = req.params;
  const { service_name } = req.body;
  const guest_id = req.userData.guest_id;

  if (!guest_id) {
    if (!req.userData.position) {
      return next(new HttpError('Unauthorized: Staff or guest authentication required.', 401));
    }
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [bookingRows] = await connection.query(
      `SELECT guest_id, check_out_date FROM booking WHERE booking_id = ?`,
      [booking_id]
    );

    if (bookingRows.length === 0) {
      return next(new HttpError('Booking not found.', 404));
    }

    if (!(req.userData.position || bookingRows[0].guest_id == guest_id)) {
      return next(new HttpError('Unauthorized access to this booking.', 403));
    }
    const checkOutDate = new Date(bookingRows[0].check_out_date);
    const currentDate = new Date();

    checkOutDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    if (checkOutDate <= currentDate) {
      return next(HttpError("Check out has already been done", 409))
    }

    const [price] = await connection.query(`SELECT services_price FROM services WHERE service_name = ?`, [service_name]);
    if (price.length === 0) {
      return next(HttpError('Service not found', 404));
    }

    const [result] = await connection.query(
      `INSERT INTO service_booking (service_name, booking_id)
         VALUES (?, ?)`,
      [service_name, booking_id]
    );

    await connection.query(
      `UPDATE payments SET services_price = services_price + ?, total_amount = total_amount + ?
      WHERE booking_id = ?`,
      [(price[0].services_price) * services_gst, (price[0].services_price) * services_gst, booking_id]
    );

    await connection.commit();
    res.status(201).json({ message: 'Service request for room submitted', serviceId: result.insertId });
  } catch (error) {
    await connection.rollback();
    const httpError = new HttpError('Error while requesting service for room booking', 500);
    return next(httpError);
  } finally {
    connection.release();
  }
};

// Hall booking service request
exports.requestHallService = async (req, res, next) => {
  const { hall_booking_id } = req.params;
  const { service_name } = req.body;
  const guest_id = req.userData.guest_id;

  if (!guest_id) {
    if (!req.userData.position) {
      return next(new HttpError('Unauthorized: Staff or guest authentication required.', 401));
    }
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [bookingRows] = await connection.query(
      `SELECT guest_id, check_out_date FROM banquet_hall_booking WHERE hall_booking_id = ?`,
      [hall_booking_id]
    );

    if (bookingRows.length === 0) {
      return next(new HttpError('Booking not found.', 404));
    }

    if (!(req.userData.position || bookingRows[0].guest_id == guest_id)) {
      return next(new HttpError('Unauthorized access to this booking.', 403));
    }
    const checkOutDate = new Date(bookingRows[0].check_out_date);
    const currentDate = new Date();

    checkOutDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    if (checkOutDate <= currentDate) {
      return next(HttpError("Check out has already been done", 409))
    }
    const [price] = await connection.query(`SELECT services_price FROM services WHERE service_name = ?`, [service_name]);
    if (price.length === 0) {
      return next(new HttpError('Service not found', 404));
    }

    const [result] = await connection.query(
      `INSERT INTO service_booking (service_name, hall_booking_id)
         VALUES (?, ?)`,
      [service_name, hall_booking_id]
    );
    await connection.query(
      `UPDATE payments SET services_price = services_price + ?, total_amount = total_amount + ?
      WHERE hall_booking_id = ?`,
      [(price[0].services_price * services_gst), (price[0].services_price * services_gst), hall_booking_id]
    );

    await connection.commit();
    res.status(201).json({ message: 'Service request for hall submitted', serviceId: result.insertId });
  } catch (error) {
    await connection.rollback();
    const httpError = new HttpError('Error while requesting service for hall booking', 500);
    return next(httpError);
  } finally {
    connection.release();
  }
};