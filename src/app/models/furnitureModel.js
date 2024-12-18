const db = require('../../config/db');

const addFurniture = async (room_number, furniture) => {
    const connection = await db.getConnection()
    try {
        const query = 'INSERT INTO room_furniture (room_number, name, number) VALUES (?, ?, ?)';
        const { name, number } = furniture;
        console.log("add " + name + " " + number)
        //console.log(connection)
        await connection.execute(query, [room_number, name, number]);
    } catch (err) {
        console.log('Error in add furniture')
        throw err
    }
}

const updateFurniture = async (room_number, name, number) => {
    const connection = await db.getConnection()
    try {
        await connection.execute('UPDATE room_furniture SET number = ? WHERE room_number = ? AND name = ?', [number, room_number, name]);
    } catch (err) {
        console.log('Error in update furniture!')
        throw err
    }
}

const getFurniture = async (room_number) => {
    const connection = await db.getConnection()
    try {
        const [furnitures] = await connection.execute('SELECT name, number FROM room_furniture WHERE room_number = ?', [room_number]);
        return furnitures;
    } catch (err) {
        console.log('Error in get furniture!')
        throw err
    }
}

module.exports = {
    addFurniture,
    updateFurniture,
    getFurniture
}