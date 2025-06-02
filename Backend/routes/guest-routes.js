const express = require('express');
const guestController = require('../controllers/guest-controller');
const guestAuth = require('../middlewares/guestAuth');
const guestOrStaffAuth = require('../middlewares/guestOrStaffAuth');
const router = express.Router();

// signup login
router.post('/signup', guestController.signup)
router.post('/verify-otp', guestController.verifyOtp);
router.post('/login', guestController.login)

router.post("/getprice", guestController.getPrice);
router.get('/getroomsprice', guestController.getroomsPrice);
router.get('/getbanquetsprice', guestController.getbanquetsPrice);
router.get('/getmenu', guestController.getMenuItems);   
router.get('/getservices', guestController.getServices)
router.post("/send-msg", guestController.sendmsg)


// router.use(guestAuth)
router.use(guestOrStaffAuth);

// Guest data
router.get('/:guestId', guestController.getUserData);   

// // Booking routes
router.get('/bookings/:guestId', guestController.getBookingsByGuestId);
router.get('/room-booking/:booking_id', guestController.getRoomBookingData);
router.get('/hall-booking/:hall_booking_id', guestController.getHallBookingData);
router.post('/room-booking/:guest_id', guestController.createRoomBooking);
router.post('/hall-booking/:guest_id', guestController.createBanquetBooking);

// Food ordering routes
router.post('/room-booking/:booking_id/order-food', guestController.orderFoodinRoom);
router.post('/hall-booking/:hall_booking_id/order-food', guestController.orderFoodInHall);

// Feedback routes
router.post('/room-booking/:booking_id/feedback', guestController.submitRoomFeedback);
router.post('/hall-booking/:hall_booking_id/feedback', guestController.submitHallFeedback);

// Service request routes
router.post('/room-booking/:booking_id/request-service', guestController.requestRoomService);
router.post('/hall-booking/:hall_booking_id/request-service', guestController.requestHallService);

module.exports = router;
