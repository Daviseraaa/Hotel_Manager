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

        const roominforQuery = 'INSERT INTO room_infor (room_number, floor, area, hour_price, daily_price, type, image, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await connection.execute(roominforQuery, [roomNumber, floor, area, hour_price, daily_price, type, image, notes]);

        if (Array.isArray(furniture) && furniture.length > 0) {
            await furnitureModel.addFurniture(number, furniture);
        }

        await db.commitTransaction();
        return true;
    } catch (err) {
        await db.rollbackTransaction();
        console.log('Error in creating room!');
        throw err;
    }
}

const deleteRoom = async (number) => {
    const connection = await db.getConnection();
    try {
        await db.beginTransaction();
        
        await connection.execute('DELETE FROM room WHERE number = ?', [roomNumber]);

        await db.commitTransaction();
        return true;
    } catch (err) {
        await db.rollbackTransaction();
        console.log('Error in deleting room!');
        throw err;
    }
}

const updateRoom = async (number, rstatus, floor, area, hour_price, daily_price, type, image, notes, furniture) => {
    const connection = await db.getConnection();
    try {
        await db.beginTransaction()

        await connection.execute('UPDATE room SET status = ? WHERE number = ?', [rstatus, number]);

        await connection.execute('UPDATE room_infor SET floor = ?, area = ?, hour_price = ?, daily_price = ?, type = ?, image = ?, notes = ? WHERE room_number = ?',
            [floor, area, hour_price, daily_price, type, image, notes, number]);
        
        if (Array.isArray(furniture)) {
            await furnitureModel.updateFurniture(number, furniture); 
        }

        await db.commitTransaction()
        return true;
    } catch (err) {
        await db.rollbackTransaction()
        console.log("Error in update room")
        throw err
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
        const [rooms] = await connection.execute('SELECT * FROM room_infor WHERE room_number = ?', [roomNumber]);
        const furnitures = await furnitureModel.getFurniture(number); 
        const [status] = await connection.execute('SELECT status FROM room WHERE number = ?', [roomNumber])
        return { ...rooms[0], furnitures, status: status[0].status};
    } catch (err) {
        console.log('Error in get room detail!')
        throw err;
    }
}

module.exports = {
    checkRoomExists,
    createRoom,
    deleteRoom,
    updateRoom,
    getRoomData,
    getRoomDetail
}