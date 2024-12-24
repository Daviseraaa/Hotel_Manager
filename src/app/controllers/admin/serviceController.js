const serviceModel = require('../../models/serviceModel')
const serverStore = require('../../../config/serverStore')
const db = require('../../../config/db')


const renderServicePage = async (req, res) => {
    try {
        const services = await serviceModel.getServiceList();
        res.render('admin/service/index', {
            session: req.session,
            services
        });
    } catch (err) {
        res.status(500).send({ message: 'Lỗi khi tải danh sách dịch vụ: ' + err.message });
    }
}

const getServiceByID = async (req, res) => {
    const { id } = req.params
    try {
        const service = await serviceModel.getServiceById(id)
        
        if (!service) {
            return res.status(404).json({ message: 'Dịch vụ không tồn tại.' });
        }

        res.json(service);
    } catch (err) {
        console.log("Lỗi khi lấy thông tin dịch vụ!")
        res.status(500).json({message: "Lỗi khi lấy thông tin dịch vụ!"})
    }

}

const handleCreateService = async (req, res) => {
    const folderName = 'service';
    const upload = serverStore.uploadWithFolder(folderName);
    
    upload.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(500).send({success: false, message: "Lỗi khi tải file"});
        }
        
        var img
        try{
            img = `/img/${folderName}/${req.file.filename}`;
        } catch (err) {
            img = `/img/default/service.jpg`
        }

        const serviceData = {
            ...req.body,
            image: img,
        }

        try {
            await serviceModel.createService(serviceData, img);
            res.redirect('/admin/service')
        } catch (err) {
            if (req.file && img !== "/img/default/service.jpg") {
                serverStore.deleteFile(img)
            } 
   
            res.status(500).json({ message: 'Lỗi hệ thống: ' + err.message });
        }
    })
}

const handleDeleteService = async (req, res) => {
    const { id } = req.params;
    const { img } = req.body;
    try {
        if (img && img !== "/img/default/service.jpg") {
            serverStore.deleteFile(img)
        }

        const result = await serviceModel.deleteService(id);

        if (result) {
            return res.status(200).json({ success: "OK"})
        } else {
            return res.status(404).json({ message: "Dịch vụ không tồn tại" });
        }
    } catch (err) {
        res.status(500).json({ message: 'Lỗi hệ thống: ' + err.message });
    }
}

const handleEditService = async (req, res) => {
    const folderName = 'service';
    const upload = serverStore.uploadWithFolder(folderName);

    upload.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(500).send('Lỗi khi tải lên file!');
        }

        const { id } = req.params;
        const { name, price, inventory, unit, income, currentImage } = req.body;

        const newImage = req.file ? `/img/${folderName}/${req.file.filename}` : currentImage;
        try {
            const updates = { name, price, inventory, unit, income, image: newImage };

            await serviceModel.updateService(id, updates)

            res.json({ success: true, message: "Cập nhật thành công." });
        } catch (err) {
            console.error('Lỗi khi cập nhật dịch vụ:', err);
            if (req.file && image !== "/img/default/service.jpg") {
                serverStore.deleteFile(image)
            }   
            res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật dịch vụ.' });
        }
    })
}

module.exports = {
    renderServicePage,
    getServiceByID,
    handleCreateService,
    handleDeleteService,
    handleEditService
}