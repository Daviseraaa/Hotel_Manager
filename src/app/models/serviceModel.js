const db = require("../../config/db")

const checkServiceExits = async (id) => {
    const connection = await db.getConnection()
    try {
        const [rows] = await connection.execute('SELECT * FROM service WHERE id = ?', [id])
        return rows.length > 0
    } catch (err) {
        throw new Error("Error checking service: " + err.message)
    }
}

const createService = async (serviceData) => {
    const connection = await db.getConnection()
    try {
        console.log(serviceData)
        await db.beginTransaction()
        const query = 'INSERT INTO service (name, price, income, inventory, unit, image) VALUES (?, ?, ?, ?, ?, ?)'
        await connection.execute(query, [serviceData.name, serviceData.price, serviceData.income, serviceData.inventory, serviceData.unit, serviceData.image])

        await db.commitTransaction()
        return true;
    } catch (err) {
        await db.rollbackTransaction()
        throw new Error("Error create newService:" + err.message)
    }
}

const deleteService = async (id) => {
    const connection = await db.getConnection()
    try {
        await db.beginTransaction()
        const query = "DELETE from service WHERE id = ?"
        await connection.execute(query, [id])

        await db.commitTransaction()
        return true;
    } catch (err) {
        await db.rollbackTransaction()
        throw new Error("Error delete Service: " + err.message)
    }
}

const updateService = async (serviceId, serviceData) => {
    const connection = await db.getConnection()
    try {        
        await connection.execute('UPDATE service SET name = ?, price = ?, income = ?, inventory = ?, unit = ?, image = ? WHERE id = ?', 
                                    [serviceData.name, serviceData.price, serviceData.income, serviceData.inventory, serviceData.unit, serviceData.image, serviceId])
        
                                    return true
    } catch (err) {
        throw new Error("Update service failed: " + err.message)
    }
}

const getServiceList = async () => {
    const connection = await db.getConnection()
    try {
        const [serviceList] = await connection.execute("SELECT * FROM service")
        return serviceList
    } catch (err) {
        throw new Error("Get Service List Failed: " + err.message)
    }
}

const getServiceById = async (id) => {
    const connection = await db.getConnection()
    try {
        const [service] = await connection.execute("SELECT * from service WHERE id = ?", [id])
        return service[0]
    } catch (err) {
        throw new Error("Get Service Failed: " + err.message)
    }
}

const getServicesByBookingId = async (booking_id) => {
    const connection = await db.getConnection()
    try {
        const [services] = await connection.execute("SELECT * from serving WHERE booking_id = ?", [booking_id])
        return services
    } catch (err) {
        throw new Error("Get Serving Failed: " + err.message)
    }
}

module.exports = {
    checkServiceExits,
    createService,
    deleteService,
    updateService,
    getServiceList,
    getServiceById,
    getServicesByBookingId
}