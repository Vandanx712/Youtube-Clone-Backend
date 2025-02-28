import multer from "multer";
// import fs from 'fs'

// const uploadir = 'uploads'
// const storage = multer.diskStorage({
//     destination:function(req,file,cb){
//         if (!fs.existsSync(uploadir)) {
//             fs.mkdirSync(uploadir, { recursive: true });
//             console.log(" 'uploads/' folder created.");
//         }
//         cb(null, uploadir)
//     },
//     filename:function(req,file,cb){
//         cb(null, file.originalname)
//     }
// })
// const upload = multer({storage:storage})

// export default upload

    

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage,
})

export default upload