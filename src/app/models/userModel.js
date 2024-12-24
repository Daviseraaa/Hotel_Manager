const db = require('../../config/db');

// Tìm người dùng bằng email
const findByUsername = async (username) => {
    const connection = await db.getConnection()
    try {
        const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0] || null;
    }
    catch (err) {
        console.error('Error finding user!', err);
        throw err;
    }
};

// Tìm bằng ID
const findByUserID = async (user_id) => {
    const connection = await db.getConnection()
    try {
        const [rows] = await connection.execute('SELECT * FROM users WHERE users.id = ?', [user_id]);
        return rows[0];
    }
    catch (err) {
        console.error('Error finding user!', err);
        throw err;
    }
};

// Tạo người dùng mới
const createUser = async (username, password, role = 'user') => {
    const connection = await db.getConnection()
    try {
        const [result] = await connection.execute('INSERT INTO users (username, hash, role) VALUES (?, ?, ?)', [username, password, role]);
        console.log(`Create user id: ${result.insertId}`)
        return result.insertId;
    }
    catch (err) {
        console.error('Error creating user!', err);
        throw err;
    }

};

// Thêm thông tin cho người dùng
const addUserinfor = async (user_id ,{first_name, last_name, email, phone, address}) => {
    const connection = await db.getConnection()
    try {
        const [row] = await connection.execute('INSERT INTO users_infor (user_id, first_name, last_name, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)', [user_id, first_name, last_name, email, phone, address]);
        return row.user_id;
    }
    catch (err) {
        console.error('Error adding user infor!', err);
        throw err;
    }
}

const getBookings = async (userId) => {
    const connection = await db.getConnection()
    const query = `SELECT id, room_number, room_type, from_time, to_time, income FROM history WHERE user_id = ?`;
    const [bookings] = await connection.execute(query, [userId]);
    return bookings  
}
  
const getServices = async (userId) => {
    const connection = await db.getConnection()
    const query = `
        SELECT hs.service_name, hs.number
        FROM history_serve hs
        JOIN history h ON hs.history_id = h.id
        WHERE h.user_id = ?`;
    const [ services ] = await connection.execute(query, [userId]);
    return services
}

// Tìm bằng ID
const getUserInfor = async (user_id) => {
    const connection = await db.getConnection()
    try {
        const [rows] = await connection.execute('SELECT * FROM users JOIN users_infor ON users.id = users_infor.user_id WHERE users.id = ?', [user_id]);
        return rows[0];
    }
    catch (err) {
        console.error('Error finding user!', err);
        throw err;
    }
};

// Xóa bằng ID
const deleteByID = async (user_id) => {
    const connection = await db.getConnection()
    try {
        const [rows] = await connection.execute('DELETE FROM users WHERE id = ?', [user_id]);
        console.log(`Delete user id: ${user_id} `)
        return rows[0];
    }
    catch (err) {
        console.error('Error deleting user!', err);
        throw err;
    }
};

const getAllUser = async () => {
    const connection = await db.getConnection()
    try {
        const [rows] = await connection.execute('SELECT * FROM users JOIN users_infor ON users.id = users_infor.user_id');
        return rows;
    }
    catch (err) {
        console.error('Error getting user!', err);
        throw err;
    }
}

const updateUser = async (userId, userData) => {
    const connection = await db.getConnection(); 
    try {
      await db.beginTransaction();
  
      const updateUsersQuery = `
        UPDATE users 
        SET role = ?
        WHERE id = ?
      `;
      const usersResult = await connection.execute(updateUsersQuery, [userData.role, userId]);
  
      const updateUsersInforQuery = `
        UPDATE users_infor 
        SET 
          first_name = ?, 
          last_name = ?, 
          email = ?, 
          phone = ?, 
          address = ?, 
          img = ?
        WHERE user_id = ?
      `;
      const usersInforResult = await connection.execute(updateUsersInforQuery, [
        userData.first_name,
        userData.last_name,
        userData.email,
        userData.phone,
        userData.address,
        userData.img || '/img/default/prof.jpg',
        userId,
      ]);
  
      if (usersResult[0].affectedRows === 0 || usersInforResult[0].affectedRows === 0) {
        throw new Error('Không thể cập nhật thông tin người dùng.');
      }
  
      await db.commitTransaction()
      return { success: true, message: 'Cập nhật thông tin thành công.' };
    } catch (error) {
      await db.rollbackTransaction()
      console.error('Lỗi khi cập nhật thông tin người dùng:', error.message);
      return { success: false, message: 'Cập nhật thông tin thất bại.', error: error.message };
    }
};

module.exports = {
    findByUsername,
    findByUserID,
    createUser,
    addUserinfor,
    getBookings,
    getServices,
    getUserInfor,
    deleteByID,
    getAllUser,
    updateUser
};