const db = require('../../config/db');
const furnitureModel = require('./furnitureModel')

const checkRoomExists = async (number) => {
    const connection = await db.getConnection();
    try {
        const [rows] = await connection.execute('SELECT * FROM room WHERE number = ?', [roomNumber]);
        return rows.length > 0;  
    } catch (err) {
        throw err
    }
}

const createRoom = async (number, rstatus, floor, area, hour_price, daily_price, type, image, notes, furniture) => {
    const connection = await db.getConnection();
    try {
        await db.beginTransaction();

        const roomQuery = 'INSERT INTO room (number, status) VALUES (?, ?)';
        await connection.execute(roomQuery, [number, rstatus]);

        const roominforQuery = 'INSERT INTO room_infor (room_number, floor, area, hour_price, daily_price, type, img, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await connection.execute(roominforQuery, [number, floor, area, hour_price, daily_price, type, image, notes]);
        
        for (let item of furniture) {
            await furnitureModel.addFurniture(number ,item);
        }
        
        await db.commitTransaction();  
        return true;
    } catch (err) {
        await db.rollbackTransaction();
        console.log(`Error in creating room! ${err.message}`);
        throw err;
    }
}

const deleteRoom = async (number) => {
    const connection = await db.getConnection();
    try {        
        await connection.execute('DELETE FROM room WHERE number = ?', [number]);
        return true;
    } catch (err) {
        console.log('Error in deleting room!');
        throw err;
    }
}

const getRoomData = async () => {
    const connection = await db.getConnection();
    try {
        const [rooms] = await connection.execute('SELECT * FROM room_infor');
        return rooms;
    } catch (err) {
        console.log('Error in get room data!')
        throw err;
    }
}

const getRoomDetail = async (number) => {
    const connection = await db.getConnection();
    try {
        const [rooms] = await connection.execute('SELECT * FROM room_infor WHERE room_number = ?', [number]);
        const furnitures = await furnitureModel.getFurniture(number); 
        const [status] = await connection.execute('SELECT status FROM room WHERE number = ?', [number])
        return { ...rooms[0], furnitures, status: status[0].status};
    } catch (err) {
        console.log('Error in get room detail!')
        throw err;
    }
}

const editRoom = async (room) => {
    // Chỉ cập nhật các trường có thay đổi
    let inforQuery = 'UPDATE room_infor SET ';
    let roomQuery = 'UPDATE room SET ';
    const inforValue = [];
    const roomValue = [];

    if (room.floor) {   
        inforQuery += 'floor = ?, ';
        inforValue.push(room.floor);
    }
    if (room.area) {
        inforQuery += 'area = ?, ';
        inforValue.push(room.area);
    }
    if (room.hour_price) {
        inforQuery += 'hour_price = ?, ';
        inforValue.push(room.hour_price);
    }
    if (room.daily_price) {
        inforQuery += 'daily_price = ?, ';
        inforValue.push(room.daily_price);
    }
    if (room.type) {
        inforQuery += 'type = ?, ';
        inforValue.push(room.type);
    }
    if (room.notes) {
        inforQuery += 'notes = ?, ';
        inforValue.push(room.notes);
    }
    if (room.img) {
        inforQuery += 'img = ?, ';
        inforValue.push(room.img);
    }

    if (room.status) {
        roomQuery += 'status = ?, ';
        roomValue.push(room.status);
    }

    inforQuery = inforQuery.slice(0, -2);
    inforQuery += ' WHERE room_number = ?';
    
    roomQuery = roomQuery.slice(0, -2);
    roomQuery += ' WHERE number = ?';
    
    inforValue.push(room.room_number);
    roomValue.push(room.room_number);

    console.log(room);
    console.log(inforQuery)
    console.log(inforValue)
    const connection = await db.getConnection()
    try {
        await db.beginTransaction()

        if (inforQuery !== "UPDATE room_infor SE WHERE room_number = ?") {
            await connection.execute(inforQuery, inforValue)
        }

        if (roomQuery !== "UPDATE room SE WHERE number = ?") {
            await connection.execute(roomQuery, roomValue)
        }
        
        const furnitures = room.furnitures ? JSON.parse(room.furnitures) : [];
        const newFurnitures = room.newFurnitures ? JSON.parse(room.newFurnitures) : [];
        
        // Duyệt qua mảng furnitures
        furnitures.forEach(async furniture => {
            await furnitureModel.updateFurniture(room.room_number, furniture.name, furniture.number)
        });
        
        // Duyệt qua mảng newFurnitures
        newFurnitures.forEach(async newFurniture => {
            await furnitureModel.addFurniture(room.room_number, newFurniture)
        });

    } catch (err) {
        console.log("Error in edit room! ")
        await db.rollbackTransaction()
        throw err
    }
}

module.exports = {
    checkRoomExists,
    createRoom,
    deleteRoom,
    getRoomData,
    getRoomDetail,
    editRoom
}