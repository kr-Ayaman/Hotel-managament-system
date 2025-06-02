const express = require('express');
const staffController = require('../controllers/staff-controller'); 
const staffAuth = require('../middlewares/staffAuth');

const router = express.Router();

router.post('/signin', staffController.signin);                 
router.use(staffAuth)

router.get("/getorders", staffController.getOrders)
router.patch("/:orderid/complete", staffController.markOrderComplete)
router.get("/staff/getstaffdetails", staffController.getStaffs)
router.get("/staff/:staffid", staffController.getStaffdetail)
router.delete('/staff/:staffid', staffController.removeEmployee); 
router.post("/staff/add", staffController.addEmployee)
router.patch('/staff/:staffid/salary', staffController.changeSalary); 

router.post("/available/rooms", staffController.getAvailableRooms)
router.post("/available/banquets", staffController.getAvailableBanquets)
// User management routes
router.get("/guest/get", staffController.getUsers)
router.post("/guest/add", staffController.signupUser)

// Banquet and Room Bookings
router.post("/book/room", staffController.bookRoom)
router.post("/book/banquet", staffController.bookBanquet)

// Banquet and Room Details
router.get("/cur-booking/rooms", staffController.getCurrentRoomBookings)
router.get("/up-booking/rooms", staffController.getUpcomingRoomBookings)
router.get("/past-booking/rooms", staffController.getPastRoomBookings)
router.get("/cur-booking/banquets", staffController.getCurrentBanquetBookings)
router.get("/up-booking/banquets", staffController.getUpcomingBanquetBookings)
router.get("/past-booking/banquets", staffController.getPastBanquetBookings)


// Room management routes
router.post('/rooms', staffController.createRoom);             
router.patch('/rooms/:roomType/price', staffController.modifyPriceByRoomType); 

// Banquet hall routes
router.post('/banquethall', staffController.createBanquetHall);   
router.patch('/banquethall/:hall_id/price', staffController.modifyPriceForBanquetHall); 

// Restaurant management routes
router.post('/menu/additem', staffController.addItemtoMenu);
router.patch('/menu/price', staffController.changePriceofItem); 

// Service routes
router.post('/services', staffController.addService);           



module.exports = router;
