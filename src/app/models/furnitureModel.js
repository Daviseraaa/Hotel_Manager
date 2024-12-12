const db = require('../../config/db');

const addFurniture = async (room_number, furniture) => {
    const connection = db.getConnection()
    db.beginTransaction()
    try {
        const query = 'INSERT INTO room_furniture (room_number, name, number) VALUES (?, ?, ?)';
        for (const item of furniture) {
            const { name, number } = item;
            await connection.execute(query, [room_number, name, number]);
        }
        db.commitTransaction()
    } catch (err) {
        db.rollbackTransaction()
        console.log('Error in add furniture')
        throw err
    }
}

const updateFurniture = async (room_number, name, furniture) => {
    const connection = db.getConnection()
    try {
        db.beginTransaction();

        for (item in furniture)
        {
            const { new_name, number } = furniture;
            await connection.execute('UPDATE room_furniture SET name = ?, number = ? WHERE room_number = ? AND name = ?', [new_name, number, room_number, name]);    
        }

        db.commitTransaction()
    } catch (err) {
        db.rollbackTransaction()
        console.log('Error in update furniture!')
        throw err
    }
}

const getFurniture = async (room_number) => {
    const connection = db.getConnection()
    const [furnitures] = await connection.execute('SELECT name, number FROM room_furniture WHERE room_number = ?', [room_number]);
    return furnitures;
}

module.exports = {
    addFurniture,
    updateFurniture,
    getFurniture
}