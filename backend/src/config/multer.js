const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

const storageTypes = {
  local: multer.diskStorage({
    destination: (request, file, cb) => {
      cb(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads'));
    },
    filename: (request, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        // vai gerar 16 bytes antes do nome do arquivo para não correr o risco 
        // de dois arquivos terem o mesmo nome
        if (err) cb(err);

        // hex é para converter os bytes que eu gerei no crypto em formato 
        // hexadecimal
        file.key = `${hash.toString('hex')}-${file.originalname}`;

        cb(null, file.key);
      });
    },
  }),
  s3: multerS3({
    s3: new aws.S3(),
    bucket: 'uploadexample',
    // o contentType vai entender o tipo de arquivo e vai falar para o
    // navegador abrir ele e não baixar ele
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (request, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        // vai gerar 16 bytes antes do nome do arquivo para não correr o risco 
        // de dois arquivos terem o mesmo nome
        if (err) cb(err);

        // hex é para converter os bytes que eu gerei no crypto em formato 
        // hexadecimal
        const fileName = `${hash.toString('hex')}-${file.originalname}`;

        cb(null, fileName);
      });
    },
  }),
};

module.exports = {
  dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
  storage: storageTypes[process.env.STORAGE_TYPE],
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB
  },
  fileFilter: (request, file, cb) => {
    // cb = é uma função que vai ser chamada assim que terminar a verificação
    const allowedMimes = [ // formatos para aceitar para uploads
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/gif'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true); // null é para o erro e true porque deu sucesso
    } else { // se der erro, caso o mimetype não esteja na lista allowedMimes
      cb(new Error("Invalid file type."));
    }
  },
};